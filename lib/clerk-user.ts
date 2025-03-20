/**
 * This file provides utilities for working with Clerk users
 */

// Cache user data to avoid excessive API calls
const userCache = new Map<string, any>();

/**
 * Get a username from a user ID
 * This is a simplified version since we can't access Clerk directly
 * outside of server components/actions in Next.js
 *
 * @param userId The user ID to get the username for
 * @returns A formatted username
 */
export async function getUserNameById(userId: string): Promise<string> {
  try {
    // Check cache first
    if (userCache.has(userId)) {
      return userCache.get(userId);
    }

    // If this were a full implementation, we'd lookup the user in Clerk
    // Since that's not possible here, we just return a formatted ID
    const shortUserId = userId.substring(0, 5) + '...' + userId.substring(userId.length - 5);
    const username = `${shortUserId}`;

    // Cache the result
    userCache.set(userId, username);

    return username;
  } catch (error) {
    console.error('Error getting username:', error);
    return `${userId.substring(0, 8)}...`;
  }
}