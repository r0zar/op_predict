/**
 * Utilities for working with user IDs and display names
 */

/**
 * Format a user identifier for display
 * @param userId User ID to format
 * @returns Formatted user identifier
 */
export function formatUserIdentifier(userId: string): string {
  if (!userId) return 'Anonymous';
  
  // If it's a Stacks address
  if (isStacksAddress(userId)) {
    return truncateUserId(userId);
  }
  
  // If it's a .btc name
  if (userId.endsWith('.btc')) {
    return userId;
  }
  
  // Default truncation
  return truncateUserId(userId);
}

/**
 * Check if a string is a Stacks address
 * @param str String to check
 * @returns True if it's a Stacks address
 */
export function isStacksAddress(str: string): boolean {
  return /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{28,40}$/.test(str);
}

/**
 * Truncate a user ID for display
 * @param userId User ID to truncate
 * @returns Truncated user ID
 */
export function truncateUserId(userId: string): string {
  if (!userId) return 'Anonymous';
  
  // If it's already short, return as is
  if (userId.length < 15) return userId;
  
  // For longer IDs, truncate middle
  return `${userId.substring(0, 6)}...${userId.substring(userId.length - 4)}`;
}