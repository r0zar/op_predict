import { clerkClient } from "@clerk/nextjs/server";

/**
 * Get a user's display name from their ID using Clerk
 */
export async function getUserNameById(userId: string): Promise<string | undefined> {
    try {
        const user = await clerkClient.users.getUser(userId);

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

/**
 * Format a user's ID for display (when no name is available)
 */
export function truncateUserId(userId: string): string {
    if (!userId) return "Unknown";
    return `${userId.slice(0, 5)}...${userId.slice(-5)}`;
}

/**
 * Format a Bitcoin BNS name or Stacks address for display
 */
export function formatUserIdentifier(identifier: string): string {
    // If it's a .btc name, return as is
    if (identifier.endsWith('.btc')) {
        return identifier;
    }

    // If it's a Stacks address, truncate it
    if (identifier.startsWith('SP')) {
        return truncateUserId(identifier);
    }

    // For anything else, return as is
    return identifier;
}

/**
 * Check if the string is a valid Stacks address
 */
export function isStacksAddress(value: string): boolean {
    return /^SP[A-Z0-9]{33,}$/.test(value);
} 