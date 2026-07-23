/* agent-notes: { ctx: "unit tests for payout calculation and threshold validation", deps: [src/lib/payout.ts], state: active, last: "tara@2026-07-23" } */

import { describe, it, expect } from 'vitest';
import { calculateCreatorPayout, isEligibleForPayout } from '../payout';

describe('calculateCreatorPayout', () => {
  it('calculates 80/20 revenue split correctly for ₹499 item', () => {
    const result = calculateCreatorPayout(499, 80);
    expect(result.grossAmount).toBe(499);
    expect(result.creatorSplitPercentage).toBe(80);
    expect(result.platformSplitPercentage).toBe(20);
    expect(result.creatorEarnings).toBe(399.2);
    expect(result.platformFee).toBe(99.8);
  });

  it('calculates 70/30 revenue split correctly for ₹999 item', () => {
    const result = calculateCreatorPayout(999, 70);
    expect(result.creatorEarnings).toBe(699.3);
    expect(result.platformFee).toBe(299.7);
  });

  it('handles ₹0 free items cleanly', () => {
    const result = calculateCreatorPayout(0);
    expect(result.creatorEarnings).toBe(0);
    expect(result.platformFee).toBe(0);
  });

  it('throws error for negative amount', () => {
    expect(() => calculateCreatorPayout(-100)).toThrow('Gross amount cannot be negative');
  });
});

describe('isEligibleForPayout', () => {
  it('returns true when earnings reach ₹1,000 threshold', () => {
    expect(isEligibleForPayout(1000)).toBe(true);
    expect(isEligibleForPayout(2500)).toBe(true);
  });

  it('returns false when earnings are below ₹1,000 threshold', () => {
    expect(isEligibleForPayout(999.99)).toBe(false);
    expect(isEligibleForPayout(500)).toBe(false);
  });
});
