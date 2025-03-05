import { describe, it, expect } from 'vitest';
import { calculateOutcomePercentages, isAdmin, getBaseUrl } from '../../lib/utils';

describe('Utility functions', () => {
  describe('calculateOutcomePercentages', () => {
    it('should calculate percentages based on amounts when available', () => {
      const outcomes = [
        { id: '1', amount: 60, votes: 10 },
        { id: '2', amount: 40, votes: 30 }
      ];
      
      const result = calculateOutcomePercentages(outcomes);
      
      expect(result.useFallbackVotes).toBe(false);
      expect(result.outcomesWithPercentages[0].percentage).toBe(60);
      expect(result.outcomesWithPercentages[1].percentage).toBe(40);
    });
    
    it('should fall back to votes when amounts are zero', () => {
      const outcomes = [
        { id: '1', amount: 0, votes: 25 },
        { id: '2', amount: 0, votes: 75 }
      ];
      
      const result = calculateOutcomePercentages(outcomes);
      
      expect(result.useFallbackVotes).toBe(true);
      expect(result.outcomesWithPercentages[0].percentage).toBe(25);
      expect(result.outcomesWithPercentages[1].percentage).toBe(75);
    });
    
    it('should handle zero values correctly', () => {
      const outcomes = [
        { id: '1', amount: 0, votes: 0 },
        { id: '2', amount: 0, votes: 0 }
      ];
      
      const result = calculateOutcomePercentages(outcomes);
      
      expect(result.useFallbackVotes).toBe(true);
      expect(result.outcomesWithPercentages[0].percentage).toBe(0);
      expect(result.outcomesWithPercentages[1].percentage).toBe(0);
    });
  });
  
  describe('isAdmin', () => {
    it('should return true for admin user IDs', () => {
      expect(isAdmin('user_2tjVcbojjJk2bkQd856eNE1Ax0S')).toBe(true);
      expect(isAdmin('user_2tkBcBEVGanm3LHkg6XK7j91DRj')).toBe(true);
    });
    
    it('should return false for non-admin user IDs', () => {
      expect(isAdmin('user_invalid')).toBe(false);
    });
  });
  
  describe('getBaseUrl', () => {
    const originalEnv = { ...process.env };
    
    afterEach(() => {
      process.env = { ...originalEnv };
    });
    
    it('should return NEXT_PUBLIC_APP_URL if set', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://test.example.com';
      expect(getBaseUrl()).toBe('https://test.example.com');
    });
    
    it('should return default production URL if no other options', () => {
      process.env.NEXT_PUBLIC_APP_URL = undefined;
      process.env.NODE_ENV = 'production';
      expect(getBaseUrl()).toBe('https://oppredict.com');
    });
  });
});