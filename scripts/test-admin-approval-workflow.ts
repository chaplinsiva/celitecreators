// agent-notes: { ctx: "TDD test for admin template approval, approved list filtering, and rejection transitions", deps: ["lib/adminApprovalHelpers.ts"], state: active, last: "tara@2026-08-21" }
import {
  filterTemplatesByMarketplaceStatus,
  canTransitionStatus,
  getAvailableActions,
} from "../lib/adminApprovalHelpers";

function runTests() {
  console.log("=== RUNNING ADMIN APPROVAL WORKFLOW TESTS ===");
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

  const sampleTemplates = [
    { slug: "tpl-pending-1", name: "Pending One", status: "pending", creator_shop_id: "shop-1" },
    { slug: "tpl-pending-2", name: "Pending Two", status: "pending", creator_shop_id: "shop-2" },
    { slug: "tpl-approved-1", name: "Approved One", status: "approved", creator_shop_id: "shop-1" },
    { slug: "tpl-approved-2", name: "Approved Two", status: "approved", creator_shop_id: "shop-3" },
    { slug: "tpl-rejected-1", name: "Rejected One", status: "rejected", creator_shop_id: "shop-2" },
  ];

  // 1. Filtering by Status
  const pending = filterTemplatesByMarketplaceStatus(sampleTemplates, "pending");
  assertEqual(pending.length, 2, "Filters 2 pending marketplace templates");
  assertEqual(pending.map(t => t.slug).join(","), "tpl-pending-1,tpl-pending-2", "Pending slugs match");

  const approved = filterTemplatesByMarketplaceStatus(sampleTemplates, "approved");
  assertEqual(approved.length, 2, "Filters 2 approved marketplace templates");
  assertEqual(approved.map(t => t.slug).join(","), "tpl-approved-1,tpl-approved-2", "Approved slugs match");

  const rejected = filterTemplatesByMarketplaceStatus(sampleTemplates, "rejected");
  assertEqual(rejected.length, 1, "Filters 1 rejected marketplace template");
  assertEqual(rejected[0].slug, "tpl-rejected-1", "Rejected slug matches");

  const all = filterTemplatesByMarketplaceStatus(sampleTemplates, "all");
  assertEqual(all.length, 5, "Returns all 5 marketplace submissions");

  // 2. Status Transitions
  assertEqual(canTransitionStatus("pending", "approved"), true, "Pending can transition to Approved");
  assertEqual(canTransitionStatus("pending", "rejected"), true, "Pending can transition to Rejected");
  assertEqual(canTransitionStatus("approved", "rejected"), true, "Approved template can be Re-Rejected");
  assertEqual(canTransitionStatus("rejected", "approved"), true, "Rejected template can be Re-Approved");
  assertEqual(canTransitionStatus("approved", "approved"), false, "Approved cannot transition to same status");

  // 3. Available Action Buttons
  const approvedActions = getAvailableActions("approved");
  assertEqual(approvedActions.includes("rejected"), true, "Approved template has 'reject' action available");
  assertEqual(approvedActions.includes("approved"), false, "Approved template does not have 'approve' action");

  const rejectedActions = getAvailableActions("rejected");
  assertEqual(rejectedActions.includes("approved"), true, "Rejected template has 'approve' action available");
  assertEqual(rejectedActions.includes("rejected"), false, "Rejected template does not have 'reject' action");

  const pendingActions = getAvailableActions("pending");
  assertEqual(pendingActions.includes("approved") && pendingActions.includes("rejected"), true, "Pending template has both 'approve' and 'reject' actions");

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
