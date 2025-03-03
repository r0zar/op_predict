import { bugReportStore, marketStore, userBalanceStore, userStatsStore } from "@op-predict/lib";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  ListBugReportsSchema,
  UpdateMarketSchema,
  UpdateBugReportSchema,
  AddUserBalanceSchema,
  ProcessBugReportRewardSchema,
  GetLeaderboardSchema,
  GetTopEarnersSchema,
  GetTopAccuracySchema,
  GetUserStatsSchema,
  UpdateUsernameSchema,
} from "./types.js";

// LIST BUG REPORTS
export const listBugReportsToolName = "mcp__predict__list_bug_reports";

export async function handleListBugReportsToolCall(args: unknown): Promise<string> {
  try {
    const { status } = ListBugReportsSchema.parse(args);

    // Get all bug reports
    const allReports = await bugReportStore.getBugReports();

    // Filter by status if not 'all'
    let reports = allReports;
    if (status !== 'all') {
      reports = allReports.filter(report => report.status === status);
    }

    return JSON.stringify(reports, null, 2);
  } catch (error) {
    console.error("Error in listBugReports tool:", error);
    throw error;
  }
}

export const listBugReportsTool: Tool = {
  name: listBugReportsToolName,
  description: "Get all bug reports with optional status filtering",
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
};

// UPDATE MARKET
export const updateMarketToolName = "mcp__predict__update_market";

export async function handleUpdateMarketToolCall(args: unknown): Promise<string> {
  try {
    const { marketId, data } = UpdateMarketSchema.parse(args);

    // Get the existing market
    const existingMarket = await marketStore.getMarket(marketId);
    if (!existingMarket) {
      throw new Error(`Market ${marketId} not found`);
    }

    // Update the market data
    const updatedMarket = await marketStore.updateMarket(marketId, {
      ...data,
      updatedAt: new Date().toISOString()
    });

    if (!updatedMarket) {
      throw new Error(`Failed to update market ${marketId}`);
    }

    return `Market updated successfully: ${JSON.stringify(updatedMarket, null, 2)}`;
  } catch (error) {
    console.error("Error in updateMarket tool:", error);
    throw error;
  }
}

export const updateMarketTool: Tool = {
  name: updateMarketToolName,
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
};

// UPDATE BUG REPORT
export const updateBugReportToolName = "mcp__predict__update_bug_report";

export async function handleUpdateBugReportToolCall(args: unknown): Promise<string> {
  try {
    const { reportId, data } = UpdateBugReportSchema.parse(args);

    // Update the bug report
    const updatedReport = await bugReportStore.updateBugReport(reportId, {
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    });

    return `Bug report updated successfully: ${JSON.stringify(updatedReport, null, 2)}`;
  } catch (error) {
    console.error("Error in updateBugReport tool:", error);
    throw error;
  }
}

export const updateBugReportTool: Tool = {
  name: updateBugReportToolName,
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
};

// ADD USER BALANCE
export const addUserBalanceToolName = "mcp__predict__add_user_balance";

export async function handleAddUserBalanceToolCall(args: unknown): Promise<string> {
  try {
    const { userId, amount, reason } = AddUserBalanceSchema.parse(args);

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

    // Create a transaction log (we could add this in the future)
    console.log(`Added ${amount} to user ${userId}'s balance. Reason: ${reason}`);

    return `Successfully added $${amount} to user ${userId}'s balance.\nNew balance: $${updatedBalance.availableBalance}\nReason: ${reason}`;
  } catch (error) {
    console.error("Error in addUserBalance tool:", error);
    throw error;
  }
}

export const addUserBalanceTool: Tool = {
  name: addUserBalanceToolName,
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
};

// PROCESS BUG REPORT REWARD
export const processBugReportRewardToolName = "mcp__predict__process_bug_report_reward";

export async function handleProcessBugReportRewardToolCall(args: unknown): Promise<string> {
  try {
    const {
      reportId,
      adminId,
      rewardType,
      customAmount,
      reason,
      updateStatus = true
    } = ProcessBugReportRewardSchema.parse(args);

    // Get the bug report first to get the user ID
    const existingReport = await bugReportStore.getBugReport(reportId);
    if (!existingReport) {
      return `Bug report ${reportId} not found`;
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
      return result.error || `Failed to process ${rewardType} reward for bug report ${reportId}`;
    }

    return `Successfully processed ${rewardType} reward of $${result.amount} for bug report ${reportId}.\nPaid to user: ${result.report?.createdBy}\nReason: ${reason || 'Bug report reward'}\nBug report updated: ${JSON.stringify(result.report, null, 2)}`;
  } catch (error) {
    console.error("Error in processBugReportReward tool:", error);
    throw error;
  }
}

export const processBugReportRewardTool: Tool = {
  name: processBugReportRewardToolName,
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
};

// GET LEADERBOARD
export const getLeaderboardToolName = "mcp__predict__get_leaderboard";

export async function handleGetLeaderboardToolCall(args: unknown): Promise<string> {
  try {
    const { limit } = GetLeaderboardSchema.parse(args);

    // Get leaderboard data
    const leaderboard = await userStatsStore.getLeaderboard(limit);
    
    // Include score information to ensure consistent display in UI and API
    const entriesWithScores = leaderboard.map(entry => ({
      ...entry,
      score: entry.score || userStatsStore.calculateUserScore(entry)
    }));

    return JSON.stringify(entriesWithScores, null, 2);
  } catch (error) {
    console.error("Error in getLeaderboard tool:", error);
    throw error;
  }
}

export const getLeaderboardTool: Tool = {
  name: getLeaderboardToolName,
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
};

// GET TOP EARNERS
export const getTopEarnersToolName = "mcp__predict__get_top_earners";

export async function handleGetTopEarnersToolCall(args: unknown): Promise<string> {
  try {
    const { limit } = GetTopEarnersSchema.parse(args);

    // Get top earners data
    const topEarners = await userStatsStore.getTopEarners(limit);
    
    // Include score information to ensure consistent display in UI and API
    const entriesWithScores = topEarners.map(entry => ({
      ...entry,
      score: entry.score || userStatsStore.calculateUserScore(entry)
    }));

    return JSON.stringify(entriesWithScores, null, 2);
  } catch (error) {
    console.error("Error in getTopEarners tool:", error);
    throw error;
  }
}

export const getTopEarnersTool: Tool = {
  name: getTopEarnersToolName,
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
};

// GET TOP ACCURACY
export const getTopAccuracyToolName = "mcp__predict__get_top_accuracy";

export async function handleGetTopAccuracyToolCall(args: unknown): Promise<string> {
  try {
    const { limit } = GetTopAccuracySchema.parse(args);

    // Get top accuracy data
    const topAccuracy = await userStatsStore.getTopAccuracy(limit);
    
    // Include score information to ensure consistent display in UI and API
    const entriesWithScores = topAccuracy.map(entry => ({
      ...entry,
      score: entry.score || userStatsStore.calculateUserScore(entry)
    }));

    return JSON.stringify(entriesWithScores, null, 2);
  } catch (error) {
    console.error("Error in getTopAccuracy tool:", error);
    throw error;
  }
}

export const getTopAccuracyTool: Tool = {
  name: getTopAccuracyToolName,
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
};

// GET USER STATS
export const getUserStatsToolName = "mcp__predict__get_user_stats";

export async function handleGetUserStatsToolCall(args: unknown): Promise<string> {
  try {
    const { userId } = GetUserStatsSchema.parse(args);

    // Get user stats
    const userStats = await userStatsStore.getUserStats(userId);

    if (!userStats) {
      return JSON.stringify({ error: `User stats not found for user ID: ${userId}` });
    }

    return JSON.stringify(userStats, null, 2);
  } catch (error) {
    console.error("Error in getUserStats tool:", error);
    throw error;
  }
}

export const getUserStatsTool: Tool = {
  name: getUserStatsToolName,
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
};

// UPDATE USERNAME
export const updateUsernameToolName = "mcp__predict__update_username";

export async function handleUpdateUsernameToolCall(args: unknown): Promise<string> {
  try {
    const { userId, username } = UpdateUsernameSchema.parse(args);

    // Update username in user stats
    const updatedStats = await userStatsStore.updateUsername(userId, username);

    if (!updatedStats) {
      return JSON.stringify({ error: `Failed to update username for user ID: ${userId}` });
    }

    return JSON.stringify(updatedStats, null, 2);
  } catch (error) {
    console.error("Error in updateUsername tool:", error);
    throw error;
  }
}

export const updateUsernameTool: Tool = {
  name: updateUsernameToolName,
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
};
