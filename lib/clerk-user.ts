import { clerkClient } from "@clerk/nextjs/server";
import { truncateUserId } from "./user-utils";
/**
 * Get a user's display name from their ID using Clerk
 */
export async function getUserNameById(userId: string): Promise<string> {
    // Handle anonymous or invalid user IDs before even making the API call
    if (!userId || userId === 'anonymous' || userId.length < 5) {
        return 'Anonymous';
    }
    
    try {
        const user = await (await clerkClient()).users.getUser(userId);

        // Try to get the username, otherwise use a truncated user ID
        if (user) {
            // First choice: username if available
            if (user.username) {
                return user.username;
            }

            // Second choice: first + last name if available
            const firstName = user.firstName || '';
            const lastName = user.lastName ? user.lastName.charAt(0) + '.' : '';
            if (firstName) {
                return `${firstName} ${lastName}`.trim();
            }

            // Third choice: truncated user ID with prefix
            return `User ${truncateUserId(userId)}`;
        }

        return `User ${truncateUserId(userId)}`;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        // Return a generic anonymous identifier without exposing the ID
        return 'Anonymous User';
    }
}