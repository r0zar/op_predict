'use server'

import { currentUser } from "@clerk/nextjs/server";
import { marketStore } from "wisdom-sdk";

// Types for our data
export type TopVault = {
    id: string;
    name: string;
    engagement: number;
    fairResolution: number; // Percentage
    markets: number; // Number of markets in the vault
    totalValue: number; // Total value locked in USD
}

export type FeaturedCreator = {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    marketsCreated: number;
    successRate: number; // Percentage
}

/**
 * Get top performing vaults based on engagement and fair resolution
 */
export async function getTopVaults(): Promise<TopVault[]> {
    // In a real application, this would fetch from a database
    // For now, we'll generate some mock data based on existing markets
    try {
        const markets = await marketStore.getMarkets();

        // Group markets by creator to simulate "vaults"
        const vaultMap = new Map<string, {
            markets: typeof markets,
            name: string,
            engagement: number,
            fairResolution: number
        }>();

        // Create simulated vaults based on market creators
        markets.forEach((market: any) => {
            const creatorId = market?.createdBy || 'anonymous';
            if (!vaultMap.has(creatorId)) {
                // Initialize a new vault
                vaultMap.set(creatorId, {
                    markets: [market],
                    name: generateVaultName(),
                    engagement: Math.floor(Math.random() * 5000) + 5000, // Random engagement between 5000-10000
                    fairResolution: Math.floor(Math.random() * 10) + 90 // Random fair resolution 90-100%
                });
            } else {
                // Add to existing vault
                const vault = vaultMap.get(creatorId)!;
                vault.markets.push(market);
                // Increase engagement a bit for each additional market
                vault.engagement += Math.floor(Math.random() * 500);
            }
        });

        // Convert to array and sort by engagement
        const vaults = Array.from(vaultMap.entries()).map(([id, data]) => ({
            id,
            name: data.name,
            engagement: data.engagement,
            fairResolution: data.fairResolution,
            markets: data.markets.length,
            totalValue: data.markets.reduce((sum: number, market: any) => sum + (typeof market?.poolAmount === 'number' ? market.poolAmount : 0), 0)
        }));

        // Sort by engagement and take top 3
        return vaults
            .sort((a, b) => b.engagement - a.engagement)
            .slice(0, 3);

    } catch (error) {
        console.error("Error fetching top vaults:", error);
        return defaultTopVaults;
    }
}

/**
 * Get featured creators (using dummy data since we can't use clerk.getUserList)
 */
export async function getFeaturedCreators(): Promise<FeaturedCreator[]> {
    try {
        // Get current user to exclude from featured creators
        const user = await currentUser();
        const currentUserId = user?.id;

        // Create a set of dummy creators with realistic data
        const dummyCreators: FeaturedCreator[] = [
            {
                id: "user_1",
                name: "Alex Rivera",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&h=250&fit=crop&auto=format",
                bio: "Crypto analyst with 5+ years experience in prediction markets",
                marketsCreated: 17,
                successRate: 94
            },
            {
                id: "user_2",
                name: "Sarah Chen",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&h=250&fit=crop&auto=format",
                bio: "Former quant trader specializing in political forecasting",
                marketsCreated: 23,
                successRate: 91
            },
            {
                id: "user_3",
                name: "Marcus Johnson",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&auto=format",
                bio: "Sports prediction expert with proven track record",
                marketsCreated: 14,
                successRate: 88
            },
            {
                id: "user_4",
                name: "Emily Zhao",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=250&h=250&fit=crop&auto=format",
                bio: "Tech industry insider focusing on startup outcomes",
                marketsCreated: 9,
                successRate: 96
            },
            {
                id: "user_5",
                name: "David Kim",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&h=250&fit=crop&auto=format",
                bio: "Climate scientist with expertise in environmental forecasting",
                marketsCreated: 12,
                successRate: 89
            }
        ];

        // Filter out the current user if they're in our dummy list
        // Then take 3 random creators from the list
        const filteredCreators = dummyCreators
            .filter(creator => creator.id !== currentUserId)
            .sort(() => 0.5 - Math.random()) // Shuffle the array
            .slice(0, 3); // Take top 3

        return filteredCreators.length > 0 ? filteredCreators : defaultFeaturedCreators;
    } catch (error) {
        console.error("Error with featured creators:", error);
        return defaultFeaturedCreators;
    }
}

/**
 * Get platform stats like active predictions, total value locked, etc.
 */
export async function getPlatformStats(): Promise<{
    activePredictions: number;
    totalValueLocked: number;
    upcomingResolutions: number;
}> {
    try {
        const markets = await marketStore.getMarkets();

        // Calculate actual stats based on markets
        const activePredictions = markets.length;
        const totalValueLocked = markets.reduce((sum: number, market: any) => sum + (typeof market?.poolAmount === 'number' ? market.poolAmount : 0), 0);
        const upcomingResolutions = markets.filter((m: any) => m?.status === 'active').length;

        return {
            activePredictions,
            totalValueLocked,
            upcomingResolutions
        };
    } catch (error) {
        console.error("Error fetching platform stats:", error);
        return {
            activePredictions: 15234,
            totalValueLocked: 25600000, // $25.6M
            upcomingResolutions: 89
        };
    }
}

// Helper function to generate random vault names
function generateVaultName(): string {
    const prefixes = ["Alpha", "Beta", "Gamma", "Delta", "Omega", "Sigma", "Quantum", "Hyper", "Cyber", "Meta"];
    const suffixes = ["Predict", "Vision", "Futures", "Oracle", "Foresight", "Insights", "Analysis", "Strategy", "Logic", "Mind"];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix} ${suffix}`;
}

// Helper function to generate random bios for users
function generateRandomBio(): string {
    const bios = [
        "Prediction market enthusiast and early adopter",
        "Crypto analyst with a focus on market movements",
        "Experienced forecaster specializing in tech trends",
        "Sports prediction expert with proven track record",
        "Financial markets specialist and strategic thinker",
        "Blockchain investor with an eye for emerging trends",
        "Political forecaster with expertise in global events",
        "Active trader and prediction market strategist",
        "Data analyst focusing on predictive modeling",
        "Strategic forecaster with interest in emerging technologies"
    ];

    return bios[Math.floor(Math.random() * bios.length)];
}

// Default data in case of errors
const defaultTopVaults: TopVault[] = [
    {
        id: "vault_1",
        name: "CryptoFutures",
        engagement: 9500,
        fairResolution: 98,
        markets: 12,
        totalValue: 25000
    },
    {
        id: "vault_2",
        name: "SportsBettingPro",
        engagement: 8200,
        fairResolution: 99,
        markets: 8,
        totalValue: 15000
    },
    {
        id: "vault_3",
        name: "TechTrends",
        engagement: 7800,
        fairResolution: 97,
        markets: 10,
        totalValue: 18000
    }
];

const defaultFeaturedCreators: FeaturedCreator[] = [
    {
        id: "creator_1",
        name: "Alice Crypto",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alice",
        bio: "Blockchain expert, 5 years in prediction markets",
        marketsCreated: 15,
        successRate: 94
    },
    {
        id: "creator_2",
        name: "Bob Sports",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bob",
        bio: "Former athlete, specializes in sports predictions",
        marketsCreated: 12,
        successRate: 89
    }
];