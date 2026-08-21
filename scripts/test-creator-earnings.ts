// agent-notes: { ctx: "TDD test for creator earnings, payout threshold, and ledger calculations", deps: ["lib/creatorEarnings.ts"], state: active, last: "tara@2026-08-21" }
import {
  calculateCreatorEarnings,
  calculatePayoutBalance,
  getPayoutThresholdProgress,
  PAYOUT_THRESHOLD_INR,
} from "../lib/creatorEarnings";

function runTests() {
  console.log("=== RUNNING CREATOR EARNINGS & PAYOUT TESTS ===");
  let passed = 0;
  let failed = 0;

  function assertEqual(actual: any, expected: any, testName: string) {
    if (actual === expected) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(
        `✕ FAIL: ${testName} (Expected "${expected}", got "${actual}")`
      );
      failed++;
    }
  }

  // 1. Payout Threshold Constant
  assertEqual(PAYOUT_THRESHOLD_INR, 800, "Payout threshold is ₹800");

  // 2. Order Item Earnings Calculation (80% rule)
  assertEqual(
    calculateCreatorEarnings(399, null),
    319.2,
    "Calculates 80% earnings (319.2) when creator_earnings is null for 399 price"
  );

  assertEqual(
    calculateCreatorEarnings(400, 320),
    320,
    "Uses explicit creator_earnings (320) when provided"
  );

  assertEqual(
    calculateCreatorEarnings(399, 0),
    319.2,
    "Falls back to 80% split when creator_earnings was stored as 0"
  );

  // 3. Balance Calculation
  const testItems = [
    { price: 400, creator_earnings: 320, orders: { status: "paid" } },
    { price: 399, creator_earnings: 0, orders: { status: "paid" } },
  ];
  const testPayouts = [{ amount: 0, status: "paid" }];

  const balanceResult = calculatePayoutBalance(testItems, testPayouts);
  assertEqual(
    Math.round(balanceResult.totalEarnings),
    639,
    "Total lifetime earnings correctly sums to ₹639 (320 + 319.2)"
  );
  assertEqual(
    balanceResult.paidOutAmount,
    0,
    "Paid out amount correctly sums to 0"
  );
  assertEqual(
    Math.round(balanceResult.availableBalance),
    639,
    "Available balance is ₹639"
  );
  assertEqual(balanceResult.salesCount, 2, "Sales count is 2");

  // 4. Threshold Progress Calculation
  const progress1 = getPayoutThresholdProgress(639.2);
  assertEqual(progress1.percent, 80, "₹639 is 80% of ₹800 threshold");
  assertEqual(progress1.isReady, false, "₹639 is not ready for payout (< ₹800)");
  assertEqual(
    Math.round(progress1.remainingNeeded),
    161,
    "₹161 needed to reach ₹800"
  );

  const progress2 = getPayoutThresholdProgress(1200);
  assertEqual(progress2.percent, 100, "₹1200 is 100% threshold progress");
  assertEqual(progress2.isReady, true, "₹1200 is ready for payout (>= ₹800)");
  assertEqual(progress2.remainingNeeded, 0, "0 needed when threshold reached");

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
