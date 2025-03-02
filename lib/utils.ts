import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Admin user IDs
export const ADMIN_USER_IDS = [
  'user_2tjVcbojjJk2bkQd856eNE1Ax0S',
  'user_2tkBcBEVGanm3LHkg6XK7j91DRj'
];

// Check if a user is an admin
export function isAdmin(userId?: string | null): boolean {
  if (!userId) return false;
  return ADMIN_USER_IDS.includes(userId);
}

/**
 * Calculate outcome percentages based on staked amounts with fallback to votes
 * @param outcomes Market outcomes
 * @returns Outcomes with percentages and a flag indicating if vote-based fallback was used
 */
export function calculateOutcomePercentages(outcomes: any[]) {
  // Calculate total amount staked for percentage
  const totalAmount = outcomes.reduce((sum, outcome) => sum + (outcome.amount || 0), 0);
  const useFallbackVotes = totalAmount === 0;

  // If no amount data is available, fall back to votes
  const totalVotes = useFallbackVotes
    ? outcomes.reduce((sum, outcome) => sum + (outcome.votes || 0), 0)
    : 0;

  // Update percentages
  const outcomesWithPercentages = outcomes.map(outcome => ({
    ...outcome,
    percentage: useFallbackVotes
      ? (totalVotes > 0 ? Math.round(((outcome.votes || 0) / totalVotes) * 100) : 0)
      : (totalAmount > 0 ? Math.round(((outcome.amount || 0) / totalAmount) * 100) : 0)
  }));

  return {
    outcomesWithPercentages,
    useFallbackVotes
  };
}

