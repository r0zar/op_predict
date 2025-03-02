import { clerkClient } from "@clerk/nextjs/server";
import { truncateUserId } from "./user-utils";
/**
 * Get a user's display name from their ID using Clerk
 */
export async function getUserNameById(userId: string): Promise<string | undefined> {
    try {
        const user = await (await clerkClient()).users.getUser(userId);

        // Try to get the username, or use first name + last name, or use a truncated user ID
        if (user) {
            // First choice: username if available
            if (user.username) {
                return user.username;
            }

            // Second choice: first name + last name
            if (user.firstName && user.lastName) {
                return `${user.firstName} ${user.lastName}`;
            }

            // Third choice: first name only
            if (user.firstName) {
                return user.firstName;
            }

            // Last resort: truncated user ID
            return truncateUserId(userId);
        }

        return undefined;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return truncateUserId(userId);
    }
}