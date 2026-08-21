// agent-notes: { ctx: "TDD test for template approval guard to prevent rejected or non-approved templates from showing on product pages", deps: ["lib/templateGuard.ts"], state: active, last: "tara@2026-08-21" }
import {
  isTemplateApproved,
  filterApprovedTemplates,
  shouldRenderPublicProductPage,
} from "../lib/templateGuard";

function runTests() {
  console.log("=== RUNNING TEMPLATE APPROVAL GUARD TESTS ===");
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

  // 1. isTemplateApproved Checks
  assertEqual(
    isTemplateApproved({ slug: "test-item", status: "approved" }),
    true,
    "Status 'approved' is considered approved"
  );

  assertEqual(
    isTemplateApproved({ slug: "test-item", status: "rejected" }),
    false,
    "Status 'rejected' is NOT approved and must be blocked"
  );

  assertEqual(
    isTemplateApproved({ slug: "test-item", status: "pending" }),
    false,
    "Status 'pending' is NOT approved"
  );

  assertEqual(
    isTemplateApproved({ slug: "test-item", status: "draft" }),
    false,
    "Status 'draft' is NOT approved"
  );

  assertEqual(
    isTemplateApproved({ slug: "test-item", status: null }),
    false,
    "Null status is NOT approved"
  );

  assertEqual(
    isTemplateApproved(null),
    false,
    "Null template is NOT approved"
  );

  // 2. shouldRenderPublicProductPage
  assertEqual(
    shouldRenderPublicProductPage({ slug: "greatest-promo", status: "approved" }),
    true,
    "Public product page renders for approved template"
  );

  assertEqual(
    shouldRenderPublicProductPage({ slug: "spam-template", status: "rejected" }),
    false,
    "Public product page must return 404 (not render) for rejected template"
  );

  assertEqual(
    shouldRenderPublicProductPage({ slug: "under-review", status: "pending" }),
    false,
    "Public product page must return 404 for pending template"
  );

  // 3. filterApprovedTemplates Batch Filter
  const sampleList = [
    { slug: "item-1", status: "approved" },
    { slug: "item-2", status: "rejected" },
    { slug: "item-3", status: "pending" },
    { slug: "item-4", status: "approved" },
  ];

  const approvedOnly = filterApprovedTemplates(sampleList);
  assertEqual(
    approvedOnly.length,
    2,
    "filterApprovedTemplates retains only approved items (2 out of 4)"
  );
  assertEqual(
    approvedOnly.map((t) => t.slug).join(","),
    "item-1,item-4",
    "filterApprovedTemplates matches exact approved slugs"
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
