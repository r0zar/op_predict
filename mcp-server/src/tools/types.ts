import { z } from "zod";
import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";

export const ToolInputSchema = ToolSchema.shape.inputSchema;
export type ToolInput = z.infer<typeof ToolInputSchema>;

export const GetAllMarketsSchema = z.object({});

export const ListBugReportsSchema = z.object({
    status: z.enum(['open', 'in-progress', 'resolved', 'closed', 'all']).optional().default('all').describe("Filter bug reports by status")
});

export const UpdateMarketSchema = z.object({
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

export const UpdateBugReportSchema = z.object({
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

export const AddUserBalanceSchema = z.object({
    userId: z.string().describe("The ID of the user to credit"),
    amount: z.number().min(0).describe("The amount to add to the user's balance"),
    reason: z.string().describe("Reason for adding funds (e.g., 'Bug bounty reward', 'Contest prize')")
});

export const ProcessBugReportRewardSchema = z.object({
    reportId: z.string().describe("The ID of the bug report to process reward for"),
    adminId: z.string().optional().describe("The ID of the admin processing the reward (for confirmation rewards)"),
    rewardType: z.enum(['initial', 'confirmation']).describe("Type of reward to process"),
    customAmount: z.number().optional().describe("Custom reward amount (overrides default amounts)"),
    reason: z.string().optional().describe("Custom reason for the reward"),
    updateStatus: z.boolean().optional().default(true).describe("Whether to update the bug report status")
});

