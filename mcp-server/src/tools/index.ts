import { bugReportStore, marketStore, userBalanceStore } from "@op-predict/lib";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { 
  ListBugReportsSchema,
  UpdateMarketSchema,
  UpdateBugReportSchema,
  AddUserBalanceSchema,
  ProcessBugReportRewardSchema
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
    
    // Get the existing report
    const existingReport = await bugReportStore.getBugReport(reportId);
    if (!existingReport) {
      throw new Error(`Bug report ${reportId} not found`);
    }

    // Set default reward amounts based on type
    const INITIAL_REWARD_AMOUNT = 10;
    const CONFIRMATION_REWARD_AMOUNT = 90;
    
    let rewardAmount = rewardType === 'initial' ? INITIAL_REWARD_AMOUNT : CONFIRMATION_REWARD_AMOUNT;
    if (customAmount !== undefined && customAmount > 0) {
      rewardAmount = customAmount;
    }
    
    // Set default reward reason based on type and severity
    const defaultReason = rewardType === 'initial' 
      ? `Initial bug report reward for ${existingReport.severity} severity bug` 
      : `Confirmation reward for verified ${existingReport.severity} severity bug`;
    
    const rewardReason = reason || defaultReason;
    
    // Check if the reward has already been paid to avoid duplicates
    if (rewardType === 'initial' && existingReport.initialRewardPaid) {
      return `Initial reward for bug report ${reportId} has already been paid.`;
    }
    
    if (rewardType === 'confirmation' && existingReport.confirmationRewardPaid) {
      return `Confirmation reward for bug report ${reportId} has already been paid.`;
    }
    
    // Update user balance
    const userId = existingReport.createdBy;
    const updatedBalance = await userBalanceStore.addFunds(userId, rewardAmount);
    
    if (!updatedBalance) {
      throw new Error(`Failed to update balance for user ${userId}`);
    }
    
    // Prepare bug report update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
      updatedBy: adminId || 'system'
    };
    
    // Update reward flags based on reward type
    if (rewardType === 'initial') {
      updateData.initialRewardPaid = true;
    } else {
      updateData.confirmationRewardPaid = true;
      
      // For confirmation rewards, also update confirmation details
      if (adminId) {
        updateData.confirmedBy = adminId;
        updateData.confirmedAt = new Date().toISOString();
      }
      
      // Update status to resolved if requested
      if (updateStatus && existingReport.status !== 'resolved') {
        updateData.status = 'resolved';
      }
    }
    
    // Update the bug report
    const updatedReport = await bugReportStore.updateBugReport(reportId, updateData);
    
    return `Successfully processed ${rewardType} reward of $${rewardAmount} for bug report ${reportId}.\nPaid to user: ${userId}\nNew balance: $${updatedBalance.availableBalance}\nReason: ${rewardReason}\nBug report updated: ${JSON.stringify(updatedReport, null, 2)}`;
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