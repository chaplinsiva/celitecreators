/* agent-notes: { ctx: "creator revenue split and payout calculation helper", deps: [src/types/marketplace.ts], state: active, last: "tara@2026-07-23" } */

import { PayoutCalculation } from '@/types/marketplace';

/**
 * Calculates creator earnings vs platform fee based on single product purchase price
 * @param grossAmount Price of the digital asset in INR
 * @param creatorSplitPercentage Default is 80 (creator gets 80%, platform gets 20%)
 */
export function calculateCreatorPayout(
  grossAmount: number,
  creatorSplitPercentage: number = 80
): PayoutCalculation {
  if (grossAmount < 0) {
    throw new Error('Gross amount cannot be negative');
  }

  const safeCreatorSplit = Math.min(100, Math.max(0, creatorSplitPercentage));
  const safePlatformSplit = 100 - safeCreatorSplit;

  const creatorEarnings = Math.round((grossAmount * safeCreatorSplit) / 100 * 100) / 100;
  const platformFee = Math.round((grossAmount - creatorEarnings) * 100) / 100;

  return {
    grossAmount,
    platformSplitPercentage: safePlatformSplit,
    creatorSplitPercentage: safeCreatorSplit,
    platformFee,
    creatorEarnings,
  };
}

/**
 * Validates whether a creator's earnings meet the minimum payout request threshold (₹1,000)
 */
export function isEligibleForPayout(accumulatedEarnings: number, threshold: number = 1000): boolean {
  return accumulatedEarnings >= threshold;
}
