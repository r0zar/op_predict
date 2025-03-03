import { z } from "zod";
import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";

export const ToolInputSchema = ToolSchema.shape.inputSchema;
export type ToolInput = z.infer<typeof ToolInputSchema>;

export const GetAllMarketsSchema = z.object({});

