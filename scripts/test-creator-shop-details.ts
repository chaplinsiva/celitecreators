// agent-notes: { ctx: "TDD test for creator shop details, individual financial balance aggregation, and template metrics", deps: ["lib/creatorShopDetails.ts"], state: active, last: "tara@2026-08-21" }
import {
  aggregateCreatorFinancials,
  summarizeCreatorTemplates,
  formatCreatorContactAndJoining,
} from "../lib/creatorShopDetails";

function runTests() {
  console.log("=== RUNNING CREATOR SHOP DETAILS & FINANCIALS TESTS ===");
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

  // 1. Test Financial Aggregation for Creator
  const mockOrderItems = [
    { creator_shop_id: "shop-1", price: 399, creator_earnings: 319.2 },
    { creator_shop_id: "shop-1", price: 499, creator_earnings: null }, // Should calculate 499 * 0.8 = 399.2
    { creator_shop_id: "shop-2", price: 999, creator_earnings: 799.2 },
  ];

  const mockPayoutRequests = [
    { creator_shop_id: "shop-1", amount: 300, status: "approved" },
    { creator_shop_id: "shop-1", amount: 200, status: "pending" },
    { creator_shop_id: "shop-2", amount: 500, status: "approved" },
  ];

  const financialsShop1 = aggregateCreatorFinancials("shop-1", mockOrderItems, mockPayoutRequests);
  assertEqual(financialsShop1.totalSales, 2, "Shop 1 total sales count is 2");
  assertEqual(financialsShop1.grossRevenue, 898, "Shop 1 gross revenue is ₹898");
  assertEqual(financialsShop1.lifetimeEarnings, 718.4, "Shop 1 lifetime earnings (80%) is ₹718.4");
  assertEqual(financialsShop1.paidOutAmount, 300, "Shop 1 paid out amount is ₹300");
  assertEqual(financialsShop1.holdingBalance, 418.4, "Shop 1 holding/available balance is ₹418.4 (718.4 - 300)");
  assertEqual(financialsShop1.pendingPayoutAmount, 200, "Shop 1 pending payout amount is ₹200");

  // 2. Test Template Summary
  const mockTemplates = [
    { creator_shop_id: "shop-1", slug: "t1", status: "approved" },
    { creator_shop_id: "shop-1", slug: "t2", status: "approved" },
    { creator_shop_id: "shop-1", slug: "t3", status: "pending" },
    { creator_shop_id: "shop-1", slug: "t4", status: "rejected" },
    { creator_shop_id: "shop-2", slug: "t5", status: "approved" },
  ];

  const templateSummaryShop1 = summarizeCreatorTemplates("shop-1", mockTemplates);
  assertEqual(templateSummaryShop1.totalTemplates, 4, "Shop 1 has 4 total templates");
  assertEqual(templateSummaryShop1.approvedCount, 2, "Shop 1 has 2 approved templates");
  assertEqual(templateSummaryShop1.pendingCount, 1, "Shop 1 has 1 pending template");
  assertEqual(templateSummaryShop1.rejectedCount, 1, "Shop 1 has 1 rejected template");

  // 3. Test Contact & Joining Formatting
  const mockShop = {
    id: "shop-1",
    name: "Pixel Master Studio",
    slug: "pixelmaster",
    phone: "9876543210",
    email: "creator@celitemarket.in",
    joined_community: true,
    created_at: "2026-08-15T10:00:00Z",
    upi_id: "creator@upi",
    account_holder_name: "Pixel Master",
    bank_account_number: null,
    bank_ifsc: null,
  };

  const contactDetails = formatCreatorContactAndJoining(mockShop, { email: "user@celitemarket.in" });
  assertEqual(contactDetails.primaryEmail, "creator@celitemarket.in", "Uses shop email when present");
  assertEqual(contactDetails.phone, "9876543210", "Returns correct phone number");
  assertEqual(contactDetails.joinedCommunity, true, "Returns community joined true");
  assertEqual(contactDetails.payoutMethod, "UPI: creator@upi", "Formatted UPI payout method");

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
