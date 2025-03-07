'use server';

import { userStatsStore } from 'wisdom-sdk';

// Get store instance
import { getUserNameById } from '@/lib/clerk-user';
import { currentUser } from '@clerk/nextjs/server';

/* 
 * NOTE: We use the calculateUserScore method from userStatsStore
 * for consistency across frontend and backend
 */

// Types for responses from actions
export type LeaderboardResponse = {
    success: boolean;
    entries?: any[];
    totalCount?: number;
    error?: string;
};

/**
 * Get the main leaderboard with top performers
 */
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardResponse> {
    try {
        // Get all entries for total count (could be optimized with a count-only query in the future)
        const allEntries = await userStatsStore.getTopUsers(100); // Get up to 100 to estimate total
        const totalCount = allEntries.length;

        // Get paginated entries
        const entries = await userStatsStore.getTopUsers(limit);

        // For each entry, if there's no username, try to get it from Clerk
        const entriesWithUsernames = await Promise.all(
            entries.map(async (entry) => {
                if (!entry.username) {
                    const username = await getUserNameById(entry.userId);
                    return { ...entry, username };
                }
                return entry;
            })
        );

        return {
            success: true,
            entries: entriesWithUsernames,
            totalCount
        };
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return {
            success: false,
            error: 'Failed to fetch leaderboard',
        };
    }
}

/**
 * Get the top earners leaderboard
 */
export async function getTopEarners(limit: number = 10): Promise<LeaderboardResponse> {
    try {
        // Get all entries for total count (could be optimized with a count-only query in the future)
        const allEntries = await userStatsStore.getTopEarners(100); // Get up to 100 to estimate total
        const totalCount = allEntries.length;

        // Get paginated entries
        const entries = await userStatsStore.getTopEarners(limit);

        // For each entry, if there's no username, try to get it from Clerk
        const entriesWithUsernames = await Promise.all(
            entries.map(async (entry) => {
                if (!entry.username) {
                    const username = await getUserNameById(entry.userId);
                    return { ...entry, username };
                }
                return entry;
            })
        );

        return {
            success: true,
            entries: entriesWithUsernames,
            totalCount
        };
    } catch (error) {
        console.error('Error fetching top earners:', error);
        return {
            success: false,
            error: 'Failed to fetch top earners',
        };
    }
}

/**
 * Get the top accuracy leaderboard
 */
export async function getTopAccuracy(limit: number = 10): Promise<LeaderboardResponse> {
    try {
        // Get all entries for total count (could be optimized with a count-only query in the future)
        const allEntries = await userStatsStore.getTopAccurate(100); // Get up to 100 to estimate total
        const totalCount = allEntries.length;

        // Get paginated entries
        const entries = await userStatsStore.getTopAccurate(limit);

        // For each entry, if there's no username, try to get it from Clerk
        const entriesWithUsernames = await Promise.all(
            entries.map(async (entry) => {
                if (!entry.username) {
                    const username = await getUserNameById(entry.userId);
                    return { ...entry, username };
                }
                return entry;
            })
        );

        return {
            success: true,
            entries: entriesWithUsernames,
            totalCount
        };
    } catch (error) {
        console.error('Error fetching top accuracy:', error);
        return {
            success: false,
            error: 'Failed to fetch top accuracy',
        };
    }
}

/**
 * Get the current user's rank and stats
 */
export async function getCurrentUserStats(): Promise<any> {
    try {
        const user = await currentUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Get the user's stats
        const stats = await userStatsStore.getUserStats(user.id);

        if (!stats) {
            return {
                success: true,
                stats: {
                    userId: user.id,
                    username: user.username || `${user.id.substring(0, 5)}...${user.id.substring(user.id.length - 5)}`,
                    totalPredictions: 0,
                    correctPredictions: 0,
                    accuracy: 0,
                    totalAmount: 0,
                    totalEarnings: 0,
                    lastUpdated: new Date().toISOString(),
                    score: 0,  // Include score in stats object
                    rank: 0    // Include rank in stats object
                }
            };
        }

        // Get all leaderboard entries to find the user's rank
        const allEntries = await userStatsStore.getTopUsers(100);  // Get top 100 for now
        const userRank = allEntries.findIndex(entry => entry.userId === user.id) + 1;

        // Calculate the user's score using the same algorithm
        const userScore = userStatsStore.calculateUserScore(stats);

        // Add score and rank to the existing stats
        const enhancedStats = {
            ...stats,
            score: userScore,
            rank: userRank > 0 ? userRank : 0
        };

        return {
            success: true,
            stats: enhancedStats
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
            success: false,
            error: 'Failed to fetch user stats',
        };
    }
}

/**
 * Get stats for multiple users at once
 * This is used by the predictions table to show stats for each user
 */
export async function getMultipleUserStats(userIds: string[]): Promise<{
    success: boolean;
    stats?: Record<string, any>;
    error?: string;
}> {
    try {
        if (!userIds || userIds.length === 0) {
            return { success: true, stats: {} };
        }

        // Filter out duplicate IDs
        const uniqueUserIds = [...new Set(userIds)];
        
        // Initialize stats object with default values
        const statsObj: Record<string, any> = {};
        
        // Fetch stats for each user in parallel
        await Promise.all(
            uniqueUserIds.map(async (userId) => {
                try {
                    // Skip 'anonymous' users
                    if (userId === 'anonymous') {
                        statsObj[userId] = {
                            userId: 'anonymous',
                            totalPredictions: 0,
                            correctPredictions: 0,
                            accuracy: 0,
                            pnl: 0,
                            totalAmount: 0,
                            wonAmount: 0,
                            lostAmount: 0
                        };
                        return;
                    }
                    
                    // Get stats from the store
                    const userStats = await userStatsStore.getUserStats(userId);
                    
                    if (userStats) {
                        statsObj[userId] = {
                            ...userStats,
                            // Calculate P&L as totalEarnings - totalAmount
                            pnl: userStats.totalEarnings - userStats.totalAmount
                        };
                    } else {
                        // If no stats found, add default zeros
                        statsObj[userId] = {
                            userId,
                            totalPredictions: 0,
                            correctPredictions: 0,
                            accuracy: 0,
                            pnl: 0,
                            totalAmount: 0,
                            wonAmount: 0,
                            lostAmount: 0
                        };
                    }
                } catch (err) {
                    console.error(`Error fetching stats for user ${userId}:`, err);
                    // Add default values on error
                    statsObj[userId] = {
                        userId,
                        totalPredictions: 0,
                        correctPredictions: 0,
                        accuracy: 0,
                        pnl: 0,
                        totalAmount: 0,
                        wonAmount: 0,
                        lostAmount: 0
                    };
                }
            })
        );
        
        return { success: true, stats: statsObj };
    } catch (error) {
        console.error("Error fetching multiple user stats:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to fetch user stats" 
        };
    }
}