import { kv } from '@vercel/kv';
import { Prediction } from './prediction-store';

// Define user stats types
export type UserStats = {
    userId: string;
    username?: string;
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
    totalAmount: number;
    totalEarnings: number;
    lastUpdated: string;
};

export type LeaderboardEntry = UserStats & {
    rank?: number;
};

// KV store keys
const USER_STATS_KEY = 'user_stats';
const LEADERBOARD_KEY = 'leaderboard';
const LEADERBOARD_EARNINGS_KEY = 'leaderboard_earnings';
const LEADERBOARD_ACCURACY_KEY = 'leaderboard_accuracy';

// User stats store with Vercel KV
export const userStatsStore = {
    // Get user stats for a specific user
    async getUserStats(userId: string): Promise<UserStats | null> {
        try {
            if (!userId) return null;

            const stats = await kv.get<UserStats>(`${USER_STATS_KEY}:${userId}`);
            return stats || null;
        } catch (error) {
            console.error(`Error getting user stats for ${userId}:`, error);
            return null;
        }
    },

    // Update user stats when a prediction is made
    async updateStatsForNewPrediction(userId: string, prediction: Prediction): Promise<UserStats> {
        try {
            // Get current stats or create new ones
            const currentStats = await this.getUserStats(userId) || {
                userId,
                totalPredictions: 0,
                correctPredictions: 0,
                accuracy: 0,
                totalAmount: 0,
                totalEarnings: 0,
                lastUpdated: new Date().toISOString()
            };

            // Update stats
            const updatedStats: UserStats = {
                ...currentStats,
                totalPredictions: currentStats.totalPredictions + 1,
                totalAmount: currentStats.totalAmount + prediction.amount,
                lastUpdated: new Date().toISOString()
            };

            // Recalculate accuracy
            updatedStats.accuracy =
                updatedStats.totalPredictions > 0
                    ? (updatedStats.correctPredictions / updatedStats.totalPredictions) * 100
                    : 0;

            // Store updated stats
            await kv.set(`${USER_STATS_KEY}:${userId}`, JSON.stringify(updatedStats));

            // Update leaderboard sorted sets for efficient querying
            await this.updateLeaderboardEntries(updatedStats);

            return updatedStats;
        } catch (error) {
            console.error(`Error updating stats for user ${userId}:`, error);
            throw error;
        }
    },

    // Update user stats when a prediction is resolved
    async updateStatsForResolvedPrediction(
        userId: string,
        prediction: Prediction,
        isCorrect: boolean,
        earnings: number
    ): Promise<UserStats> {
        try {
            // Get current stats
            const currentStats = await this.getUserStats(userId);
            if (!currentStats) {
                throw new Error(`No stats found for user ${userId}`);
            }

            // Update stats
            const updatedStats: UserStats = {
                ...currentStats,
                correctPredictions: isCorrect
                    ? currentStats.correctPredictions + 1
                    : currentStats.correctPredictions,
                totalEarnings: currentStats.totalEarnings + earnings,
                lastUpdated: new Date().toISOString()
            };

            // Recalculate accuracy
            updatedStats.accuracy =
                updatedStats.totalPredictions > 0
                    ? (updatedStats.correctPredictions / updatedStats.totalPredictions) * 100
                    : 0;

            // Store updated stats
            await kv.set(`${USER_STATS_KEY}:${userId}`, JSON.stringify(updatedStats));

            // Update leaderboard sorted sets
            await this.updateLeaderboardEntries(updatedStats);

            return updatedStats;
        } catch (error) {
            console.error(`Error updating stats for resolved prediction, user ${userId}:`, error);
            throw error;
        }
    },

    // Update user's username (when available from auth provider)
    async updateUsername(userId: string, username: string): Promise<UserStats | null> {
        try {
            const stats = await this.getUserStats(userId);
            if (!stats) return null;

            const updatedStats: UserStats = {
                ...stats,
                username,
                lastUpdated: new Date().toISOString()
            };

            await kv.set(`${USER_STATS_KEY}:${userId}`, JSON.stringify(updatedStats));

            // Update leaderboard entries
            await this.updateLeaderboardEntries(updatedStats);

            return updatedStats;
        } catch (error) {
            console.error(`Error updating username for user ${userId}:`, error);
            return null;
        }
    },

    // Update leaderboard sorted sets for efficient querying
    async updateLeaderboardEntries(stats: UserStats): Promise<void> {
        try {
            // Add to earnings leaderboard (sorted by total earnings)
            await kv.zadd(
                LEADERBOARD_EARNINGS_KEY,
                { score: stats.totalEarnings, member: stats.userId }
            );

            // Add to accuracy leaderboard (sorted by accuracy)
            await kv.zadd(
                LEADERBOARD_ACCURACY_KEY,
                { score: stats.accuracy, member: stats.userId }
            );

            // Add to general leaderboard (combined score using earnings as primary factor)
            // This is a simplified score calculation - can be adjusted based on preference
            const combinedScore = stats.totalEarnings + (stats.accuracy * 10);
            await kv.zadd(
                LEADERBOARD_KEY,
                { score: combinedScore, member: stats.userId }
            );
        } catch (error) {
            console.error('Error updating leaderboard entries:', error);
            throw error;
        }
    },

    // Get top leaderboard entries by earnings
    async getTopEarners(limit: number = 10): Promise<LeaderboardEntry[]> {
        try {
            // Get top user IDs sorted by earnings (highest first)
            const userIds = await kv.zrange(LEADERBOARD_EARNINGS_KEY, 0, limit - 1, { rev: true });

            // Get full stats for each user ID
            const leaderboard = await this.getUserStatsForIds(userIds as string[]);

            // Add rank
            return leaderboard.map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));
        } catch (error) {
            console.error('Error getting top earners:', error);
            return [];
        }
    },

    // Get top leaderboard entries by accuracy
    async getTopAccuracy(limit: number = 10): Promise<LeaderboardEntry[]> {
        try {
            // Get top user IDs sorted by accuracy (highest first)
            const userIds = await kv.zrange(LEADERBOARD_ACCURACY_KEY, 0, limit - 1, { rev: true });

            // Get full stats for each user ID
            const leaderboard = await this.getUserStatsForIds(userIds as string[]);

            // Add rank
            return leaderboard.map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));
        } catch (error) {
            console.error('Error getting top accuracy:', error);
            return [];
        }
    },

    // Get top leaderboard entries by combined score
    async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
        try {
            // Get top user IDs sorted by combined score (highest first)
            const userIds = await kv.zrange(LEADERBOARD_KEY, 0, limit - 1, { rev: true });

            // Get full stats for each user ID
            const leaderboard = await this.getUserStatsForIds(userIds as string[]);

            // Add rank
            return leaderboard.map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    },

    // Helper to get multiple user stats by IDs
    async getUserStatsForIds(userIds: string[]): Promise<UserStats[]> {
        try {
            if (userIds.length === 0) return [];

            // Get stats for each user ID
            const statsPromises = userIds.map(id => this.getUserStats(id));
            const statsResults = await Promise.all(statsPromises);

            // Filter out any null results
            return statsResults.filter(Boolean) as UserStats[];
        } catch (error) {
            console.error('Error getting user stats for IDs:', error);
            return [];
        }
    }
}; 