'use server';

import { getUserStatsStore } from 'wisdom-sdk';
import type { LeaderboardEntry, UserStats } from 'wisdom-sdk';

// Get store instance
const userStatsStore = getUserStatsStore();
import { getUserNameById } from '@/lib/clerk-user';
import { currentUser } from '@clerk/nextjs/server';

/* 
 * NOTE: We use the calculateUserScore method from userStatsStore
 * for consistency across frontend and backend
 */

// Types for responses from actions
export type LeaderboardResponse = {
    success: boolean;
    entries?: LeaderboardEntry[];
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
        const allEntries = await userStatsStore.getTopAccuracy(100); // Get up to 100 to estimate total
        const totalCount = allEntries.length;
        
        // Get paginated entries
        const entries = await userStatsStore.getTopAccuracy(limit);

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
export async function getCurrentUserStats(): Promise<{
    success: boolean;
    stats?: LeaderboardEntry;
    error?: string;
}> {
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

        return {
            success: true,
            stats: {
                ...stats,
                score: userScore,
                rank: userRank > 0 ? userRank : 0
            }
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
            success: false,
            error: 'Failed to fetch user stats',
        };
    }
} 