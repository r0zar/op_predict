'use server';

import { userStatsStore, LeaderboardEntry } from '@/lib/user-stats-store';
import { getUserNameById } from '@/lib/clerk-user';
import { currentUser } from '@clerk/nextjs/server';

// Types for responses from actions
export type LeaderboardResponse = {
    success: boolean;
    entries?: LeaderboardEntry[];
    error?: string;
};

/**
 * Get the main leaderboard with top performers
 */
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardResponse> {
    try {
        const entries = await userStatsStore.getLeaderboard(limit);

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
    rank?: number;
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
                    username: user.username || `${user.firstName} ${user.lastName}`,
                    totalPredictions: 0,
                    correctPredictions: 0,
                    accuracy: 0,
                    totalAmount: 0,
                    totalEarnings: 0,
                    lastUpdated: new Date().toISOString(),
                },
                rank: 0,  // No rank yet
            };
        }

        // Get all leaderboard entries to find the user's rank
        const allEntries = await userStatsStore.getLeaderboard(100);  // Get top 100 for now
        const userRank = allEntries.findIndex(entry => entry.userId === user.id) + 1;

        return {
            success: true,
            stats,
            rank: userRank > 0 ? userRank : undefined,
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
            success: false,
            error: 'Failed to fetch user stats',
        };
    }
} 