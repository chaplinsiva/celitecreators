// agent-notes: { ctx: "Pure calculation helpers for creator earnings, 80/20 split, and payout threshold progress", deps: [], state: active, last: "sato@2026-08-21" }

export const PAYOUT_THRESHOLD_INR = 800;

/**
 * Computes net creator earnings for an item (80% net revenue split)
 */
export function calculateCreatorEarnings(price: number | string | null, creatorEarnings?: number | string | null): number {
  const numPrice = Number(price || 0);
  const numEarnings = Number(creatorEarnings);

  if (creatorEarnings !== null && creatorEarnings !== undefined && !isNaN(numEarnings) && numEarnings > 0) {
    return numEarnings;
  }

  // Standard 80/20 revenue share
  return Math.round(numPrice * 0.8 * 100) / 100;
}

export interface PayoutBalanceResult {
  totalEarnings: number;
  paidOutAmount: number;
  pendingPayoutAmount: number;
  availableBalance: number;
  salesCount: number;
}

/**
 * Calculates earnings, payouts, and available withdrawable balance
 */
export function calculatePayoutBalance(
  orderItems: any[] = [],
  payoutRequests: any[] = []
): PayoutBalanceResult {
  const paidOrderItems = (orderItems || []).filter((item: any) => {
    const order = Array.isArray(item.orders) ? item.orders[0] : item.orders;
    return !order || order.status === "paid" || order.status === "completed";
  });

  const totalEarnings = paidOrderItems.reduce((sum: number, item: any) => {
    return sum + calculateCreatorEarnings(item.price, item.creator_earnings);
  }, 0);

  const paidOutAmount = (payoutRequests || [])
    .filter((p: any) => p.status === "paid")
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  const pendingPayoutAmount = (payoutRequests || [])
    .filter((p: any) => p.status === "pending")
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  const availableBalance = Math.max(0, totalEarnings - paidOutAmount - pendingPayoutAmount);

  return {
    totalEarnings,
    paidOutAmount,
    pendingPayoutAmount,
    availableBalance,
    salesCount: paidOrderItems.length,
  };
}

export interface PayoutThresholdProgress {
  currentBalance: number;
  threshold: number;
  percent: number;
  isReady: boolean;
  remainingNeeded: number;
}

/**
 * Computes progress towards the payout threshold
 */
export function getPayoutThresholdProgress(balance: number, threshold: number = PAYOUT_THRESHOLD_INR): PayoutThresholdProgress {
  const safeBalance = Math.max(0, Number(balance || 0));
  const percent = Math.min(100, Math.round((safeBalance / threshold) * 100));
  const isReady = safeBalance >= threshold;
  const remainingNeeded = Math.max(0, threshold - safeBalance);

  return {
    currentBalance: safeBalance,
    threshold,
    percent,
    isReady,
    remainingNeeded,
  };
}
