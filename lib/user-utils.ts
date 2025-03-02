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