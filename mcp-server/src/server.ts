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
    userBalanceStore,
    userStatsStore
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

const ListBugReportsSchema = z.object({
    status: z.enum(['open', 'in-progress', 'resolved', 'closed', 'all']).optional().default('all').describe("Filter bug reports by status")
});

const UpdateMarketSchema = z.object({
    marketId: z.string().describe("The ID of the market to update"),
    data: z.object({
        name: z.string().optional().describe("The name of the market"),
        description: z.string().optional().describe("Description of the market"),
        category: z.string().optional().describe("Category of the market"),
        endDate: z.string().optional().describe("End date for the market (ISO string)"),
        imageUrl: z.string().optional().describe("URL for a market image"),
        status: z.enum(['draft', 'active', 'resolved', 'cancelled']).optional().describe("Status of the market")
    }).describe("Data to update on the market")
});

const UpdateBugReportSchema = z.object({
    reportId: z.string().describe("The ID of the bug report to update"),
    data: z.object({
        title: z.string().optional().describe("Title of the bug report"),
        description: z.string().optional().describe("Detailed description of the bug"),
        severity: z.string().optional().describe("Severity of the bug (low, medium, high, critical)"),
        status: z.enum(['open', 'in-progress', 'resolved', 'closed']).optional().describe("Status of the bug report"),
        resolution: z.string().optional().describe("Resolution details for the bug report"),
        url: z.string().optional().describe("URL where the bug was found")
    }).describe("Data to update on the bug report")
});

const AddUserBalanceSchema = z.object({
    userId: z.string().describe("The ID of the user to credit"),
    amount: z.number().min(0).describe("The amount to add to the user's balance"),
    reason: z.string().describe("Reason for adding funds (e.g., 'Bug bounty reward', 'Contest prize')")
});

const ProcessBugReportRewardSchema = z.object({
    reportId: z.string().describe("The ID of the bug report to process reward for"),
    adminId: z.string().optional().describe("The ID of the admin processing the reward (for confirmation rewards)"),
    rewardType: z.enum(['initial', 'confirmation']).describe("Type of reward to process"),
    customAmount: z.number().optional().describe("Custom reward amount (overrides default amounts)"),
    reason: z.string().optional().describe("Custom reason for the reward"),
    updateStatus: z.boolean().optional().default(true).describe("Whether to update the bug report status")
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

// User stats schemas
const GetLeaderboardSchema = z.object({
    limit: z.number().optional().default(10).describe("Number of users to return in the leaderboard")
});

const GetTopEarnersSchema = z.object({
    limit: z.number().optional().default(10).describe("Number of users to return in the top earners list")
});

const GetTopAccuracySchema = z.object({
    limit: z.number().optional().default(10).describe("Number of users to return in the top accuracy list")
});

const GetUserStatsSchema = z.object({
    userId: z.string().describe("The ID of the user to get stats for")
});

const UpdateUsernameSchema = z.object({
    userId: z.string().describe("The ID of the user to update"),
    username: z.string().describe("The new username for the user")
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
    CREATE_BATCH_MARKETS = "create_batch_markets",
    LIST_BUG_REPORTS = "list_bug_reports",
    UPDATE_MARKET = "update_market",
    UPDATE_BUG_REPORT = "update_bug_report",
    ADD_USER_BALANCE = "add_user_balance",
    PROCESS_BUG_REPORT_REWARD = "process_bug_report_reward",
    GET_LEADERBOARD = "get_leaderboard",
    GET_TOP_EARNERS = "get_top_earners",
    GET_TOP_ACCURACY = "get_top_accuracy",
    GET_USER_STATS = "get_user_stats",
    UPDATE_USERNAME = "update_username",
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
        const [markets, bugReports, leaderboard, topEarners, topAccuracy] = await Promise.all([
            marketStore.getMarkets(),
            bugReportStore.getBugReports(),
            userStatsStore.getLeaderboard(),
            userStatsStore.getTopEarners(),
            userStatsStore.getTopAccuracy()
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
            })),
            {
                uri: `leaderboard://overall`,
                name: `Overall Leaderboard`,
                mimeType: "application/json",
                text: JSON.stringify(leaderboard)
            },
            {
                uri: `leaderboard://earnings`,
                name: `Top Earners Leaderboard`,
                mimeType: "application/json",
                text: JSON.stringify(topEarners)
            },
            {
                uri: `leaderboard://accuracy`,
                name: `Top Accuracy Leaderboard`,
                mimeType: "application/json",
                text: JSON.stringify(topAccuracy)
            },
            // Add user stats resources for all users in the leaderboard
            ...leaderboard.map(entry => ({
                uri: `user-stats://${entry.userId}`,
                name: entry.username || `User ${entry.userId}`,
                mimeType: "application/json",
                text: JSON.stringify(entry)
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
                {
                    uriTemplate: "leaderboard://overall",
                    name: "Overall Leaderboard",
                    description: "The overall user leaderboard"
                },
                {
                    uriTemplate: "leaderboard://earnings",
                    name: "Earnings Leaderboard",
                    description: "The top earners leaderboard"
                },
                {
                    uriTemplate: "leaderboard://accuracy",
                    name: "Accuracy Leaderboard",
                    description: "The top accuracy leaderboard"
                },
                {
                    uriTemplate: "user-stats://{userId}",
                    name: "User Stats",
                    description: "Statistical data for a specific user"
                }
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

        // Leaderboard resources
        if (uri.startsWith("leaderboard://")) {
            const leaderboardType = uri.split("//")[1];
            let leaderboardData;

            // Get appropriate leaderboard data based on type
            if (leaderboardType === "overall") {
                leaderboardData = await userStatsStore.getLeaderboard();
            } else if (leaderboardType === "earnings") {
                leaderboardData = await userStatsStore.getTopEarners();
            } else if (leaderboardType === "accuracy") {
                leaderboardData = await userStatsStore.getTopAccuracy();
            } else {
                throw new Error(`Unknown leaderboard type: ${leaderboardType}`);
            }

            return {
                contents: [{
                    uri,
                    text: JSON.stringify(leaderboardData)
                }]
            };
        }

        // User stats
        if (uri.startsWith("user-stats://")) {
            const userId = uri.split("//")[1];
            const userStats = await userStatsStore.getUserStats(userId);
            if (!userStats) {
                throw new Error(`User stats not found for user ${userId}`);
            }
            return {
                contents: [{
                    uri,
                    text: JSON.stringify(userStats)
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
                // Check if it's a leaderboard resource
                else if (uri.startsWith('leaderboard://')) {
                    // Always notify about leaderboard updates since they may change frequently
                    server.notification({
                        method: "notifications/resources/updated",
                        params: { uri },
                    });
                    console.log(`Notified update for leaderboard resource`);
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
            },
            {
                name: ToolName.LIST_BUG_REPORTS,
                description: "List all bug reports",
                inputSchema: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            enum: ["open", "in-progress", "resolved", "closed", "all"],
                            default: "all",
                            description: "Filter bug reports by status"
                        }
                    }
                }
            },
            {
                name: ToolName.UPDATE_MARKET,
                description: "Update a prediction market",
                inputSchema: {
                    type: "object",
                    properties: {
                        marketId: {
                            type: "string",
                            description: "The ID of the market to update"
                        },
                        data: {
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
                                category: {
                                    type: "string",
                                    description: "Category of the market"
                                },
                                endDate: {
                                    type: "string",
                                    description: "End date for the market (ISO string)"
                                },
                                imageUrl: {
                                    type: "string",
                                    description: "URL for a market image"
                                },
                                status: {
                                    type: "string",
                                    enum: ["draft", "active", "resolved", "cancelled"],
                                    description: "Status of the market"
                                }
                            },
                            description: "Data to update on the market"
                        }
                    },
                    required: ["marketId", "data"]
                }
            },
            {
                name: ToolName.UPDATE_BUG_REPORT,
                description: "Update a bug report",
                inputSchema: {
                    type: "object",
                    properties: {
                        reportId: {
                            type: "string",
                            description: "The ID of the bug report to update"
                        },
                        data: {
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
                                status: {
                                    type: "string",
                                    enum: ["open", "in-progress", "resolved", "closed"],
                                    description: "Status of the bug report"
                                },
                                resolution: {
                                    type: "string",
                                    description: "Resolution details for the bug report"
                                },
                                url: {
                                    type: "string",
                                    description: "URL where the bug was found"
                                }
                            },
                            description: "Data to update on the bug report"
                        }
                    },
                    required: ["reportId", "data"]
                }
            },
            {
                name: ToolName.ADD_USER_BALANCE,
                description: "Add funds to a user's balance for rewards like bug bounties or contest prizes",
                inputSchema: {
                    type: "object",
                    properties: {
                        userId: {
                            type: "string",
                            description: "The ID of the user to credit"
                        },
                        amount: {
                            type: "number",
                            description: "The amount to add to the user's balance (must be positive)"
                        },
                        reason: {
                            type: "string",
                            description: "Reason for adding funds (e.g., 'Bug bounty reward', 'Contest prize')"
                        }
                    },
                    required: ["userId", "amount", "reason"]
                }
            },
            {
                name: ToolName.PROCESS_BUG_REPORT_REWARD,
                description: "Process a reward payment for a bug report and update the report status",
                inputSchema: {
                    type: "object",
                    properties: {
                        reportId: {
                            type: "string",
                            description: "The ID of the bug report to process reward for"
                        },
                        adminId: {
                            type: "string",
                            description: "The ID of the admin processing the reward (for confirmation rewards)"
                        },
                        rewardType: {
                            type: "string",
                            enum: ["initial", "confirmation"],
                            description: "Type of reward to process"
                        },
                        customAmount: {
                            type: "number",
                            description: "Custom reward amount (overrides default amounts: $10 for initial, $90 for confirmation)"
                        },
                        reason: {
                            type: "string",
                            description: "Custom reason for the reward"
                        },
                        updateStatus: {
                            type: "boolean",
                            default: true,
                            description: "Whether to update the bug report status to 'resolved' for confirmation rewards"
                        }
                    },
                    required: ["reportId", "rewardType"]
                }
            },
            {
                name: ToolName.GET_LEADERBOARD,
                description: "Get the overall leaderboard data sorted by combined score",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "number",
                            default: 10,
                            description: "Number of users to return in the leaderboard"
                        }
                    }
                }
            },
            {
                name: ToolName.GET_TOP_EARNERS,
                description: "Get the top earners leaderboard data sorted by total earnings",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "number",
                            default: 10,
                            description: "Number of users to return in the top earners list"
                        }
                    }
                }
            },
            {
                name: ToolName.GET_TOP_ACCURACY,
                description: "Get the top accuracy leaderboard data sorted by prediction accuracy",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "number",
                            default: 10,
                            description: "Number of users to return in the top accuracy list"
                        }
                    }
                }
            },
            {
                name: ToolName.GET_USER_STATS,
                description: "Get statistics for a specific user",
                inputSchema: {
                    type: "object",
                    properties: {
                        userId: {
                            type: "string",
                            description: "The ID of the user to get stats for"
                        }
                    },
                    required: ["userId"]
                }
            },
            {
                name: ToolName.UPDATE_USERNAME,
                description: "Update a user's username in their stats",
                inputSchema: {
                    type: "object",
                    properties: {
                        userId: {
                            type: "string",
                            description: "The ID of the user to update"
                        },
                        username: {
                            type: "string",
                            description: "The new username for the user"
                        }
                    },
                    required: ["userId", "username"]
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

            // Calculate amount from confidence
            const amount = Math.round(confidence * 100);

            // Get the market to find the appropriate outcome ID
            const market = await marketStore.getMarket(marketId);
            if (!market) {
                throw new Error(`Market ${marketId} not found`);
            }

            // Try to find an outcome that matches the prediction text, otherwise use the first outcome
            let outcomeId = market.outcomes[0]?.id;
            const matchingOutcome = market.outcomes.find(o =>
                o.name.toLowerCase() === prediction.toLowerCase()
            );
            if (matchingOutcome) {
                outcomeId = matchingOutcome.id;
            }

            if (!outcomeId) {
                throw new Error(`No valid outcomes found for market ${marketId}`);
            }

            // Use the new enhanced function that performs validation and balance updates
            const result = await predictionStore.createPredictionWithBalanceUpdate({
                marketId,
                outcomeId,
                userId: 'anonymous', // Default user
                amount: amount
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to create prediction');
            }

            return {
                content: [{
                    type: "text",
                    text: `Prediction created successfully: ${JSON.stringify(result.prediction, null, 2)}`
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

            // Create predictions for each market using the enhanced function
            const results = await Promise.all(
                predictions.map(async prediction => {
                    const { marketId, prediction: predictionValue, confidence } = prediction;
                    const amount = Math.round(confidence * 100);

                    // Get the market to find the appropriate outcome ID
                    const market = await marketStore.getMarket(marketId);
                    if (!market) {
                        return {
                            success: false,
                            marketId,
                            error: `Market ${marketId} not found`
                        };
                    }

                    // Try to find an outcome that matches the prediction text
                    let outcomeId = market.outcomes[0]?.id;
                    const matchingOutcome = market.outcomes.find(o =>
                        o.name.toLowerCase() === predictionValue.toLowerCase()
                    );
                    if (matchingOutcome) {
                        outcomeId = matchingOutcome.id;
                    }

                    if (!outcomeId) {
                        return {
                            success: false,
                            marketId,
                            error: `No valid outcomes found for market ${marketId}`
                        };
                    }

                    // Use the new enhanced function for each prediction
                    const result = await predictionStore.createPredictionWithBalanceUpdate({
                        marketId,
                        outcomeId,
                        userId: 'anonymous', // Default user
                        amount: amount
                    });

                    if (!result.success) {
                        return {
                            success: false,
                            marketId,
                            error: result.error
                        };
                    }

                    return {
                        success: true,
                        prediction: result.prediction
                    };
                })
            );

            // Check if any prediction failed
            const failures = results.filter(r => !r.success);
            if (failures.length > 0) {
                throw new Error(`Some predictions failed: ${JSON.stringify(failures)}`);
            }

            // Extract successfully created predictions
            const createdPredictions = results
                .filter(r => r.success)
                .map(r => r.prediction);

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

        if (name === ToolName.LIST_BUG_REPORTS) {
            const { status } = ListBugReportsSchema.parse(args);

            // Get all bug reports
            const allReports = await bugReportStore.getBugReports();

            // Filter by status if not 'all'
            let reports = allReports;
            if (status !== 'all') {
                reports = allReports.filter(report => report.status === status);
            }

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(reports, null, 2)
                }],
            };
        }

        if (name === ToolName.UPDATE_MARKET) {
            const { marketId, data } = UpdateMarketSchema.parse(args);

            // Get the existing market
            const existingMarket = await marketStore.getMarket(marketId);
            if (!existingMarket) {
                throw new Error(`Market ${marketId} not found`);
            }

            // Check if the update is attempting to resolve the market
            if (data.status === 'resolved' && existingMarket.status !== 'resolved') {
                // For market resolution, we need a winning outcome ID
                // In a real implementation, this should be specified in the schema
                // For now, we intelligently try to find an outcome that is mentioned in the status update
                let winningOutcomeId: number | undefined;

                // If data has a description field that mentions an outcome, try to use that
                if (data.description) {
                    // Look for outcome names in the description
                    for (const outcome of existingMarket.outcomes) {
                        if (data.description.toLowerCase().includes(outcome.name.toLowerCase())) {
                            winningOutcomeId = outcome.id;
                            break;
                        }
                    }
                }

                // If no outcome found in description, use the first outcome as fallback
                if (!winningOutcomeId) {
                    winningOutcomeId = existingMarket.outcomes[0]?.id;

                    // Ensure we have a valid outcome
                    if (!winningOutcomeId) {
                        throw new Error('No valid outcomes found for market resolution');
                    }
                }

                // Use the new enhanced market resolution function
                const resolutionResult = await marketStore.resolveMarketWithPayouts(
                    marketId,
                    winningOutcomeId,
                    'system' // Admin ID
                );

                if (!resolutionResult.success) {
                    throw new Error(resolutionResult.error || 'Failed to resolve market');
                }

                return {
                    content: [{
                        type: "text",
                        text: `Market resolved successfully: ${JSON.stringify(resolutionResult.market, null, 2)}`
                    }],
                };
            } else {
                // For regular updates, use standard updateMarket
                const updatedMarket = await marketStore.updateMarket(marketId, {
                    ...data,
                    updatedAt: new Date().toISOString()
                });

                if (!updatedMarket) {
                    throw new Error(`Failed to update market ${marketId}`);
                }

                return {
                    content: [{
                        type: "text",
                        text: `Market updated successfully: ${JSON.stringify(updatedMarket, null, 2)}`
                    }],
                };
            }
        }

        if (name === ToolName.UPDATE_BUG_REPORT) {
            const { reportId, data } = UpdateBugReportSchema.parse(args);

            try {
                // Update the bug report
                const updatedReport = await bugReportStore.updateBugReport(reportId, {
                    ...data,
                    updatedAt: new Date().toISOString(),
                    updatedBy: 'system'
                });

                return {
                    content: [{
                        type: "text",
                        text: `Bug report updated successfully: ${JSON.stringify(updatedReport, null, 2)}`
                    }],
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to update bug report ${reportId}: ${errorMessage}`);
            }
        }

        if (name === ToolName.ADD_USER_BALANCE) {
            const { userId, amount, reason } = AddUserBalanceSchema.parse(args);

            try {
                // Check if the user exists by attempting to get their balance
                const userBalance = await userBalanceStore.getUserBalance(userId);
                if (!userBalance) {
                    throw new Error(`User ${userId} not found`);
                }

                // Add funds to the user's balance
                const updatedBalance = await userBalanceStore.addFunds(userId, amount);

                if (!updatedBalance) {
                    throw new Error(`Failed to update balance for user ${userId}`);
                }

                // Log the transaction
                console.log(`Added $${amount} to user ${userId}'s balance. Reason: ${reason}`);

                return {
                    content: [{
                        type: "text",
                        text: `Successfully added $${amount} to user ${userId}'s balance.\nNew balance: $${updatedBalance.availableBalance.toFixed(2)}\nReason: ${reason}`
                    }],
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to add balance for user ${userId}: ${errorMessage}`);
            }
        }

        if (name === ToolName.PROCESS_BUG_REPORT_REWARD) {
            try {
                const {
                    reportId,
                    adminId,
                    rewardType,
                    customAmount,
                    reason,
                    updateStatus = true
                } = ProcessBugReportRewardSchema.parse(args);

                // Get the existing report to get the user ID
                const existingReport = await bugReportStore.getBugReport(reportId);
                if (!existingReport) {
                    throw new Error(`Bug report ${reportId} not found`);
                }

                // Use the enhanced process reward payment function
                const result = await bugReportStore.processRewardPayment(
                    reportId,
                    existingReport.createdBy,
                    rewardType,
                    customAmount,
                    reason
                );

                if (!result.success) {
                    throw new Error(result.error || `Failed to process ${rewardType} reward for bug report ${reportId}`);
                }

                return {
                    content: [{
                        type: "text",
                        text: `Successfully processed ${rewardType} reward of $${result.amount} for bug report ${reportId}.\nPaid to user: ${existingReport.createdBy}\nReason: ${reason || 'Bug report reward'}\nBug report updated: ${JSON.stringify(result.report, null, 2)}`
                    }],
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to process bug report reward: ${errorMessage}`);
            }
        }

        // Handle user stats tools
        if (name === ToolName.GET_LEADERBOARD) {
            try {
                const { limit } = GetLeaderboardSchema.parse(args);
                const leaderboard = await userStatsStore.getLeaderboard(limit);
                
                // Include score information to ensure consistent display in UI and API
                const entriesWithScores = leaderboard.map(entry => ({
                    ...entry,
                    score: entry.score || userStatsStore.calculateUserScore(entry)
                }));

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(entriesWithScores, null, 2)
                    }],
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get leaderboard: ${errorMessage}`);
            }
        }

        if (name === ToolName.GET_TOP_EARNERS) {
            try {
                const { limit } = GetTopEarnersSchema.parse(args);
                const topEarners = await userStatsStore.getTopEarners(limit);
                
                // Include score information to ensure consistent display in UI and API
                const entriesWithScores = topEarners.map(entry => ({
                    ...entry,
                    score: entry.score || userStatsStore.calculateUserScore(entry)
                }));

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(entriesWithScores, null, 2)
                    }],
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get top earners: ${errorMessage}`);
            }
        }

        if (name === ToolName.GET_TOP_ACCURACY) {
            try {
                const { limit } = GetTopAccuracySchema.parse(args);
                const topAccuracy = await userStatsStore.getTopAccuracy(limit);
                
                // Include score information to ensure consistent display in UI and API
                const entriesWithScores = topAccuracy.map(entry => ({
                    ...entry,
                    score: entry.score || userStatsStore.calculateUserScore(entry)
                }));

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(entriesWithScores, null, 2)
                    }],
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get top accuracy: ${errorMessage}`);
            }
        }

        if (name === ToolName.GET_USER_STATS) {
            try {
                const { userId } = GetUserStatsSchema.parse(args);
                const userStats = await userStatsStore.getUserStats(userId);

                if (!userStats) {
                    return {
                        content: [{
                            type: "text",
                            text: JSON.stringify({ error: `User stats not found for user ID: ${userId}` })
                        }],
                    };
                }

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(userStats, null, 2)
                    }],
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to get user stats: ${errorMessage}`);
            }
        }

        if (name === ToolName.UPDATE_USERNAME) {
            try {
                const { userId, username } = UpdateUsernameSchema.parse(args);
                const updatedStats = await userStatsStore.updateUsername(userId, username);

                if (!updatedStats) {
                    return {
                        content: [{
                            type: "text",
                            text: JSON.stringify({ error: `Failed to update username for user ID: ${userId}` })
                        }],
                    };
                }

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(updatedStats, null, 2)
                    }],
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                throw new Error(`Failed to update username: ${errorMessage}`);
            }
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