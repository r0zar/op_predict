import { clerkClient } from "@clerk/nextjs/server";
import { truncateUserId } from "./user-utils";
/**
 * Get a user's display name from their ID using Clerk
 */
export async function getUserNameById(userId: string): Promise<string | undefined> {
    try {
        const user = await (await clerkClient()).users.getUser(userId);

        // Try to get the username, otherwise use a truncated user ID
        if (user) {
            // First choice: username if available
            if (user.username) {
                return user.username;
            }

            // Last resort: truncated user ID with prefix
            return `User-${truncateUserId(userId)}`;
        }

        return undefined;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return `User-${truncateUserId(userId)}`;
    }
}