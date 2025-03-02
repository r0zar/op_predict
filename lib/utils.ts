import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Admin user IDs
const ADMIN_USER_IDS = ['user_2tjVcbojjJk2bkQd856eNE1Ax0S'];

// Check if a user is an admin
export function isAdmin(userId?: string | null): boolean {
  if (!userId) return false;
  return ADMIN_USER_IDS.includes(userId);
}

