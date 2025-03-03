import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ReadResourceRequestSchema,
    ListToolsRequestSchema,
    Tool,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
    CreateMessageRequest,
    CreateMessageResultSchema,
    SubscribeRequestSchema,
    UnsubscribeRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
    marketStore,
    predictionStore,
    bugReportStore,
} from "@op-predict/lib";
import { z } from "zod";

// Get directory path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the mcp-server directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Tool schemas
const GetMarketSchema = z.object({
    marketId: z.string().describe("The ID of the market to retrieve")
});

const GetPredictionSchema = z.object({
    predictionId: z.string().describe("The ID of the prediction to retrieve")
});

const GetBugReportSchema = z.object({
    reportId: z.string().describe("The ID of the bug report to retrieve")
});

const CreatePredictionSchema = z.object({
    marketId: z.string().describe("The ID of the market to predict on"),
    prediction: z.string().describe("The prediction value"),
    confidence: z.number().min(0).max(1).describe("Confidence level (0-1)")
});

const CreateMarketSchema = z.object({
    name: z.string().describe("The name of the market"),
    description: z.string().describe("Description of the market"),
    type: z.enum(['binary', 'multiple']).describe("Type of market (binary or multiple-choice)"),
    outcomes: z.array(
        z.object({
            id: z.number(),
            name: z.string()
        })
    ).describe("Possible outcomes for the market"),
    category: z.string().default("general").describe("Category of the market"),
    endDate: z.string().optional().describe("End date for the market (ISO string)"),
    imageUrl: z.string().optional().describe("URL for a market image")
});

const CreateBugReportSchema = z.object({
    title: z.string().describe("Title of the bug report"),
    description: z.string().describe("Detailed description of the bug"),
    severity: z.string().describe("Severity of the bug (low, medium, high, critical)"),
    url: z.string().optional().describe("URL where the bug was found")
});

// Add after other schemas
const ListMarketsWithPredictionsSchema = z.object({
    category: z.string().optional().describe("Optional category to filter markets by"),
    status: z.enum(['active', 'ended', 'all']).default('all').describe("Filter markets by status")
});

// Add new schemas for markets without predictions and batch predictions
const ListMarketsWithoutPredictionsSchema = z.object({
    category: z.string().optional().describe("Optional category to filter markets by"),
    status: z.enum(['active', 'ended', 'all']).default('active').describe("Filter markets by status")
});

const CreateBatchPredictionsSchema = z.object({
    predictions: z.array(z.object({
        marketId: z.string().describe("The ID of the market to predict on"),
        prediction: z.string().describe("The prediction value"),
        confidence: z.number().min(0).max(1).describe("Confidence level (0-1)")
    })).describe("Array of predictions to create")
});

// Add new schema for batch market creation
const CreateBatchMarketsSchema = z.object({
    markets: z.array(z.object({
        name: z.string().describe("The name of the market"),
        description: z.string().describe("Description of the market"),
        type: z.enum(['binary', 'multiple']).describe("Type of market (binary or multiple-choice)"),
        outcomes: z.array(
            z.object({
                id: z.number(),
                name: z.string()
            })
        ).describe("Possible outcomes for the market"),
        category: z.string().default("general").describe("Category of the market"),
        endDate: z.string().optional().describe("End date for the market (ISO string)"),
        imageUrl: z.string().optional().describe("URL for a market image")
    })).describe("Array of markets to create")
});

// Tool names enum
enum ToolName {
    GET_MARKET = "get_market",
    GET_PREDICTION = "get_prediction",
    GET_BUG_REPORT = "get_bug_report",
    CREATE_PREDICTION = "create_prediction",
    CREATE_MARKET = "create_market",
    CREATE_BUG_REPORT = "create_bug_report",
    LIST_MARKETS_WITH_PREDICTIONS = "list_markets_with_predictions",
    LIST_MARKETS_WITHOUT_PREDICTIONS = "list_markets_without_predictions",
    CREATE_BATCH_PREDICTIONS = "create_batch_predictions",
    CREATE_BATCH_MARKETS = "create_batch_markets"
}

// Prompt names enum
enum PromptName {
    MARKET_ANALYSIS = "market_analysis",
    PREDICTION_ADVICE = "prediction_advice"
}

export const createServer = () => {
    const server = new Server(
        {
            name: "op_predict",
            version: "1.0.0",
            description: "Prediction Market Analysis Server"
        },
        {
            capabilities: {
                resources: { subscribe: true },
                tools: {},
                prompts: {}
            }
        }
    );

    // Set up resource update subscription tracking
    let subscriptions = new Set<string>();
    let updateInterval: NodeJS.Timeout | undefined;

    // Set up update interval for subscribed resources
    updateInterval = setInterval(() => {
        for (const uri of subscriptions) {
            server.notification({
                method: "notifications/resources/updated",
                params: { uri },
            });
        }
    }, 10000); // Check for updates every 10 seconds

    // Helper for requestSampling from client
    const requestSampling = async (
        context: string,
        uri: string,
        maxTokens: number = 100,
    ) => {
        const request: CreateMessageRequest = {
            method: "sampling/createMessage",
            params: {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: `Resource ${uri} context: ${context}`,
                        },
                    },
                ],
                systemPrompt: "You are a prediction market analysis assistant.",
                maxTokens,
                temperature: 0.7,
                includeContext: "thisServer",
            },
        };

        return await server.request(request, CreateMessageResultSchema);
    };

    // Resource Handlers
    server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
        const PAGE_SIZE = 100;
        const cursor = request.params?.cursor;
        let startIndex = 0;

        // Get all resources from different stores
        const [markets, bugReports] = await Promise.all([
            marketStore.getMarkets(),
            bugReportStore.getBugReports()
        ]);

        // Combine all resources into a single array with individual URIs
        const allResources = [
            ...markets.map(market => ({
                uri: `market://${market.id}`,
                name: market.name || `Market ${market.id}`,
                mimeType: "application/json",
                text: JSON.stringify(market)
            })),
            ...bugReports.map(report => ({
                uri: `bug-report://${report.id}`,
                name: report.title || `Bug Report ${report.id}`,
                mimeType: "application/json",
                text: JSON.stringify(report)
            }))
        ];

        // Handle pagination
        if (cursor) {
            try {
                const decodedCursor = parseInt(atob(cursor), 10);
                if (!isNaN(decodedCursor)) {
                    startIndex = decodedCursor;
                }
            } catch (e) {
                console.error("Invalid cursor format:", e);
            }
        }

        const endIndex = Math.min(startIndex + PAGE_SIZE, allResources.length);
        const resources = allResources.slice(startIndex, endIndex);

        let nextCursor: string | undefined;
        if (endIndex < allResources.length) {
            nextCursor = btoa(endIndex.toString());
        }

        return {
            resources,
            nextCursor
        };
    });

    server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
        return {
            resourceTemplates: [
                {
                    uriTemplate: "market://{marketId}",
                    name: "Market",
                    description: "A prediction market"
                },
                {
                    uriTemplate: "prediction://{predictionId}",
                    name: "Prediction",
                    description: "A user's prediction on a market"
                },
                {
                    uriTemplate: "bug-report://{reportId}",
                    name: "Bug Report",
                    description: "A bug report"
                },
            ]
        };
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;

        // Market resources
        if (uri.startsWith("market://")) {
            const marketId = uri.split("//")[1];
            const market = await marketStore.getMarket(marketId);
            if (!market) {
                throw new Error(`Market ${marketId} not found`);
            }
            return {
                contents: [{
                    uri,
                    text: JSON.stringify(market)
                }]
            };
        }

        // Single prediction
        if (uri.startsWith("prediction://")) {
            const predictionId = uri.split("//")[1];
            const prediction = await predictionStore.getPrediction(predictionId);
            if (!prediction) {
                throw new Error(`Prediction ${predictionId} not found`);
            }
            return {
                contents: [{
                    uri,
                    text: JSON.stringify(prediction)
                }]
            };
        }

        // Single bug report
        if (uri.startsWith("bug-report://")) {
            const reportId = uri.split("//")[1];
            const report = await bugReportStore.getBugReport(reportId);
            if (!report) {
                throw new Error(`Bug report ${reportId} not found`);
            }
            return {
                contents: [{
                    uri,
                    text: JSON.stringify(report)
                }]
            };
        }

        throw new Error(`Unknown resource: ${uri}`);
    });

    // Subscribe to resource updates
    server.setRequestHandler(SubscribeRequestSchema, async (request) => {
        const { uri } = request.params;
        subscriptions.add(uri);

        // Request sampling from client when someone subscribes (optional)
        try {
            await requestSampling(`Resource ${uri} has been subscribed to`, uri);
        } catch (error) {
            console.error("Error requesting sampling:", error);
        }

        console.log(`Subscription added for resource: ${uri}`);
        return {};
    });

    // Unsubscribe from resource updates
    server.setRequestHandler(UnsubscribeRequestSchema, async (request) => {
        const { uri } = request.params;
        subscriptions.delete(uri);
        console.log(`Subscription removed for resource: ${uri}`);
        return {};
    });

    // Set up update interval for checking for resource changes
    updateInterval = setInterval(async () => {
        if (subscriptions.size === 0) return;

        try {
            // Check for updated markets and bug reports
            const [markets, bugReports] = await Promise.all([
                marketStore.getMarkets(),
                bugReportStore.getBugReports()
            ]);

            // Check for individual market and bug report subscriptions
            for (const uri of subscriptions) {
                // Check if it's a market resource
                if (uri.startsWith('market://')) {
                    const marketId = uri.split('//')[1];
                    const market = markets.find(m => m.id === marketId);

                    if (market) {
                        // Notify the client about the updated market
                        server.notification({
                            method: "notifications/resources/updated",
                            params: { uri },
                        });
                        console.log(`Notified update for market: ${marketId}`);
                    }
                }
                // Check if it's a bug report resource
                else if (uri.startsWith('bug-report://')) {
                    const reportId = uri.split('//')[1];
                    const report = bugReports.find(r => r.id === reportId);

                    if (report) {
                        // Notify the client about the updated bug report
                        server.notification({
                            method: "notifications/resources/updated",
                            params: { uri },
                        });
                        console.log(`Notified update for bug report: ${reportId}`);
                    }
                }
            }
        } catch (error) {
            console.error("Error checking for resource updates:", error);
        }
    }, 10000); // Check for updates every 10 seconds

    // Tool Handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const tools: Tool[] = [
            {
                name: ToolName.GET_MARKET,
                description: "Get detailed information about a specific market",
                inputSchema: {
                    type: "object",
                    properties: {
                        marketId: {
                            type: "string",
                            description: "The ID of the market to retrieve"
                        }
                    },
                    required: ["marketId"]
                }
            },
            {
                name: ToolName.GET_PREDICTION,
                description: "Get information about a specific prediction",
                inputSchema: {
                    type: "object",
                    properties: {
                        predictionId: {
                            type: "string",
                            description: "The ID of the prediction to retrieve"
                        }
                    },
                    required: ["predictionId"]
                }
            },
            {
                name: ToolName.GET_BUG_REPORT,
                description: "Get information about a specific bug report",
                inputSchema: {
                    type: "object",
                    properties: {
                        reportId: {
                            type: "string",
                            description: "The ID of the bug report to retrieve"
                        }
                    },
                    required: ["reportId"]
                }
            },
            {
                name: ToolName.CREATE_PREDICTION,
                description: "Create a new prediction for a market",
                inputSchema: {
                    type: "object",
                    properties: {
                        marketId: {
                            type: "string",
                            description: "The ID of the market to predict on"
                        },
                        prediction: {
                            type: "string",
                            description: "The prediction value"
                        },
                        confidence: {
                            type: "number",
                            description: "Confidence level (0-1)"
                        }
                    },
                    required: ["marketId", "prediction", "confidence"]
                }
            },
            {
                name: ToolName.CREATE_MARKET,
                description: "Create a new prediction market",
                inputSchema: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            description: "The name of the market"
                        },
                        description: {
                            type: "string",
                            description: "Description of the market"
                        },
                        type: {
                            type: "string",
                            enum: ["binary", "multiple"],
                            description: "Type of market (binary or multiple-choice)"
                        },
                        outcomes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "number",
                                        description: "Unique ID for the outcome"
                                    },
                                    name: {
                                        type: "string",
                                        description: "Name of the outcome"
                                    }
                                },
                                required: ["id", "name"]
                            },
                            description: "Possible outcomes for the market"
                        },
                        category: {
                            type: "string",
                            description: "Category of the market",
                            default: "general"
                        },
                        endDate: {
                            type: "string",
                            description: "End date for the market (ISO string)"
                        },
                        imageUrl: {
                            type: "string",
                            description: "URL for a market image"
                        }
                    },
                    required: ["name", "description", "type", "outcomes"]
                }
            },
            {
                name: ToolName.CREATE_BUG_REPORT,
                description: "Create a new bug report",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            description: "Title of the bug report"
                        },
                        description: {
                            type: "string",
                            description: "Detailed description of the bug"
                        },
                        severity: {
                            type: "string",
                            description: "Severity of the bug (low, medium, high, critical)"
                        },
                        url: {
                            type: "string",
                            description: "URL where the bug was found"
                        }
                    },
                    required: ["title", "description", "severity"]
                }
            },
            {
                name: ToolName.LIST_MARKETS_WITH_PREDICTIONS,
                description: "List all markets with their associated predictions",
                inputSchema: {
                    type: "object",
                    properties: {
                        category: {
                            type: "string",
                            description: "Optional category to filter markets by"
                        },
                        status: {
                            type: "string",
                            enum: ["active", "ended", "all"],
                            default: "all",
                            description: "Filter markets by status"
                        }
                    }
                }
            },
            {
                name: ToolName.LIST_MARKETS_WITHOUT_PREDICTIONS,
                description: "List all markets without their associated predictions",
                inputSchema: {
                    type: "object",
                    properties: {
                        category: {
                            type: "string",
                            description: "Optional category to filter markets by"
                        },
                        status: {
                            type: "string",
                            enum: ["active", "ended", "all"],
                            default: "active",
                            description: "Filter markets by status"
                        }
                    }
                }
            },
            {
                name: ToolName.CREATE_BATCH_PREDICTIONS,
                description: "Create multiple predictions for multiple markets",
                inputSchema: {
                    type: "object",
                    properties: {
                        predictions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    marketId: {
                                        type: "string",
                                        description: "The ID of the market to predict on"
                                    },
                                    prediction: {
                                        type: "string",
                                        description: "The prediction value"
                                    },
                                    confidence: {
                                        type: "number",
                                        description: "Confidence level (0-1)"
                                    }
                                },
                                required: ["marketId", "prediction", "confidence"]
                            },
                            description: "Array of predictions to create"
                        }
                    },
                    required: ["predictions"]
                }
            },
            {
                name: ToolName.CREATE_BATCH_MARKETS,
                description: "Create multiple prediction markets at once",
                inputSchema: {
                    type: "object",
                    properties: {
                        markets: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string",
                                        description: "The name of the market"
                                    },
                                    description: {
                                        type: "string",
                                        description: "Description of the market"
                                    },
                                    type: {
                                        type: "string",
                                        enum: ["binary", "multiple"],
                                        description: "Type of market (binary or multiple-choice)"
                                    },
                                    outcomes: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "number",
                                                    description: "Unique ID for the outcome"
                                                },
                                                name: {
                                                    type: "string",
                                                    description: "Name of the outcome"
                                                }
                                            },
                                            required: ["id", "name"]
                                        },
                                        description: "Possible outcomes for the market"
                                    },
                                    category: {
                                        type: "string",
                                        description: "Category of the market",
                                        default: "general"
                                    },
                                    endDate: {
                                        type: "string",
                                        description: "End date for the market (ISO string)"
                                    },
                                    imageUrl: {
                                        type: "string",
                                        description: "URL for a market image"
                                    }
                                },
                                required: ["name", "description", "type", "outcomes"]
                            },
                            description: "Array of markets to create"
                        }
                    },
                    required: ["markets"]
                }
            }
        ];

        return { tools };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        if (name === ToolName.GET_MARKET) {
            const { marketId } = GetMarketSchema.parse(args);
            const market = await marketStore.getMarket(marketId);

            if (!market) {
                throw new Error(`Market ${marketId} not found`);
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(market, null, 2)
                }],
            };
        }

        if (name === ToolName.GET_PREDICTION) {
            const { predictionId } = GetPredictionSchema.parse(args);
            const prediction = await predictionStore.getPrediction(predictionId);

            if (!prediction) {
                throw new Error(`Prediction ${predictionId} not found`);
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(prediction, null, 2)
                }],
            };
        }

        if (name === ToolName.GET_BUG_REPORT) {
            const { reportId } = GetBugReportSchema.parse(args);
            const report = await bugReportStore.getBugReport(reportId);

            if (!report) {
                throw new Error(`Bug report ${reportId} not found`);
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(report, null, 2)
                }],
            };
        }

        if (name === ToolName.CREATE_PREDICTION) {
            const { marketId, prediction, confidence } = CreatePredictionSchema.parse(args);

            // Check if market exists
            const market = await marketStore.getMarket(marketId);
            if (!market) {
                throw new Error(`Market ${marketId} not found`);
            }

            // Create prediction
            const newPrediction = await predictionStore.createPrediction({
                marketId,
                marketName: market.name,
                outcomeId: 1, // Default outcome id
                outcomeName: prediction, // Using the prediction text as the outcome name
                userId: 'anonymous', // Default user
                amount: Math.round(confidence * 100) // Convert confidence to amount
            });

            return {
                content: [{
                    type: "text",
                    text: `Prediction created successfully: ${JSON.stringify(newPrediction, null, 2)}`
                }],
            };
        }

        if (name === ToolName.CREATE_MARKET) {
            const marketData = CreateMarketSchema.parse(args);

            // Add default end date if not provided (7 days from now)
            if (!marketData.endDate) {
                marketData.endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            }

            // Create market
            const newMarket = await marketStore.createMarket({
                type: marketData.type,
                name: marketData.name,
                description: marketData.description,
                outcomes: marketData.outcomes,
                createdBy: 'system',
                category: marketData.category || 'general',
                endDate: marketData.endDate,
                imageUrl: marketData.imageUrl || ''
            });

            return {
                content: [{
                    type: "text",
                    text: `Market created successfully: ${JSON.stringify(newMarket, null, 2)}`
                }],
            };
        }

        if (name === ToolName.CREATE_BUG_REPORT) {
            const bugData = CreateBugReportSchema.parse(args);

            // Create bug report
            const newBugReport = await bugReportStore.createBugReport({
                ...bugData,
                createdBy: 'system',
                status: 'open'
            });

            return {
                content: [{
                    type: "text",
                    text: `Bug report created successfully: ${JSON.stringify(newBugReport, null, 2)}`
                }],
            };
        }

        if (name === ToolName.LIST_MARKETS_WITH_PREDICTIONS) {
            const { category, status } = ListMarketsWithPredictionsSchema.parse(args);

            // Get all markets
            const markets = await marketStore.getMarkets();

            // Filter markets by category if specified
            let filteredMarkets = category
                ? markets.filter(m => m.category === category)
                : markets;

            // Filter by status if not 'all'
            if (status !== 'all') {
                const now = new Date();
                filteredMarkets = filteredMarkets.filter(m => {
                    const isEnded = new Date(m.endDate) < now;
                    return status === 'ended' ? isEnded : !isEnded;
                });
            }

            // Get predictions for each market
            const marketsWithPredictions = await Promise.all(
                filteredMarkets.map(async market => {
                    const predictions = await predictionStore.getMarketPredictions(market.id);
                    return {
                        market,
                        predictions
                    };
                })
            );

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(marketsWithPredictions, null, 2)
                }],
            };
        }

        if (name === ToolName.LIST_MARKETS_WITHOUT_PREDICTIONS) {
            const { category, status } = ListMarketsWithoutPredictionsSchema.parse(args);

            // Get all markets
            const markets = await marketStore.getMarkets();

            // Filter markets by category if specified
            let filteredMarkets = category
                ? markets.filter(m => m.category === category)
                : markets;

            // Filter by status if not 'all'
            if (status !== 'all') {
                const now = new Date();
                filteredMarkets = filteredMarkets.filter(m => {
                    const isEnded = new Date(m.endDate) < now;
                    return status === 'ended' ? isEnded : !isEnded;
                });
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(filteredMarkets, null, 2)
                }],
            };
        }

        if (name === ToolName.CREATE_BATCH_PREDICTIONS) {
            const { predictions } = CreateBatchPredictionsSchema.parse(args);

            // Create predictions for each market
            const createdPredictions = await Promise.all(
                predictions.map(async prediction => {
                    const { marketId, prediction: predictionValue, confidence } = prediction;

                    // Check if market exists
                    const market = await marketStore.getMarket(marketId);
                    if (!market) {
                        throw new Error(`Market ${marketId} not found`);
                    }

                    // Create prediction
                    const newPrediction = await predictionStore.createPrediction({
                        marketId,
                        marketName: market.name,
                        outcomeId: 1, // Default outcome id
                        outcomeName: predictionValue,
                        userId: 'anonymous', // Default user
                        amount: Math.round(confidence * 100) // Convert confidence to amount
                    });

                    return newPrediction;
                })
            );

            return {
                content: [{
                    type: "text",
                    text: `Predictions created successfully: ${JSON.stringify(createdPredictions, null, 2)}`
                }],
            };
        }

        if (name === ToolName.CREATE_BATCH_MARKETS) {
            const { markets } = CreateBatchMarketsSchema.parse(args);

            // Create markets
            const createdMarkets = await Promise.all(
                markets.map(async marketData => {
                    // Add default end date if not provided (7 days from now)
                    if (!marketData.endDate) {
                        marketData.endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                    }

                    // Create market
                    const newMarket = await marketStore.createMarket({
                        type: marketData.type,
                        name: marketData.name,
                        description: marketData.description,
                        outcomes: marketData.outcomes,
                        createdBy: 'system',
                        category: marketData.category || 'general',
                        endDate: marketData.endDate,
                        imageUrl: marketData.imageUrl || ''
                    });

                    return newMarket;
                })
            );

            return {
                content: [{
                    type: "text",
                    text: `Markets created successfully: ${JSON.stringify(createdMarkets, null, 2)}`
                }],
            };
        }

        throw new Error(`Unknown tool: ${name}`);
    });

    // Prompt Handlers
    server.setRequestHandler(ListPromptsRequestSchema, async () => {
        return {
            prompts: [
                {
                    name: PromptName.MARKET_ANALYSIS,
                    description: "Analyze a prediction market",
                    arguments: [
                        {
                            name: "marketId",
                            description: "The ID of the market to analyze",
                            required: true,
                        }
                    ],
                },
                {
                    name: PromptName.PREDICTION_ADVICE,
                    description: "Get advice for making a prediction",
                    arguments: [
                        {
                            name: "marketId",
                            description: "The ID of the market to get advice for",
                            required: true,
                        }
                    ],
                }
            ],
        };
    });

    server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        if (name === PromptName.MARKET_ANALYSIS) {
            const marketId = args?.marketId as string;
            if (!marketId) {
                throw new Error("Missing required argument: marketId");
            }

            const market = await marketStore.getMarket(marketId);
            if (!market) {
                throw new Error(`Market ${marketId} not found`);
            }

            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: `Please analyze this prediction market and provide insights:\n\n${JSON.stringify(market, null, 2)}`,
                        },
                    },
                ],
            };
        }

        if (name === PromptName.PREDICTION_ADVICE) {
            const marketId = args?.marketId as string;
            if (!marketId) {
                throw new Error("Missing required argument: marketId");
            }

            const market = await marketStore.getMarket(marketId);
            if (!market) {
                throw new Error(`Market ${marketId} not found`);
            }

            // Get all predictions for this market to provide context
            const marketPredictions = await predictionStore.getMarketPredictions(marketId);

            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: `Please provide advice on making a prediction for this market:\n\nMarket: ${JSON.stringify(market, null, 2)}\n\nExisting predictions: ${JSON.stringify(marketPredictions, null, 2)}`,
                        },
                    },
                ],
            };
        }

        throw new Error(`Unknown prompt: ${name}`);
    });

    const cleanup = async () => {
        try {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
            await server.close();
            console.log("Server shutdown complete");
        } catch (err) {
            const error = err as Error;
            console.error("Error during shutdown:", error);
            throw error;
        }
    };

    return { server, cleanup };
}; 