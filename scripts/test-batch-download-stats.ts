// agent-notes: { ctx: "TDD test for batch download stats calculation and chunking", deps: ["lib/downloadStats.ts"], state: active, last: "tara@2026-08-21" }
import {
  aggregateDownloadRecords,
  chunkArray,
} from "../lib/downloadStats";

function runTests() {
  console.log("=== RUNNING BATCH DOWNLOAD STATS TESTS ===");
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

  // 1. Chunking helper for large slug lists
  const testSlugs = Array.from({ length: 125 }, (_, i) => `slug-${i + 1}`);
  const chunks = chunkArray(testSlugs, 50);
  assertEqual(chunks.length, 3, "Chunks 125 items into 3 chunks of <= 50");
  assertEqual(chunks[0].length, 50, "First chunk contains 50 items");
  assertEqual(chunks[1].length, 50, "Second chunk contains 50 items");
  assertEqual(chunks[2].length, 25, "Third chunk contains 25 items");

  // 2. Aggregate download records across downloads, free_downloads, and order_items
  const subRows = [
    { template_slug: "promo-intro" },
    { template_slug: "promo-intro" },
    { template_slug: "wedding-title" },
  ];
  const freeRows = [
    { template_slug: "promo-intro" },
    { template_slug: "free-pack" },
  ];
  const orderRows = [
    { slug: "promo-intro" },
    { slug: "wedding-title" },
    { slug: "other-item" },
  ];

  const slugsToCount = ["promo-intro", "wedding-title", "free-pack", "zero-downloads-item"];
  const counts = aggregateDownloadRecords(slugsToCount, subRows, freeRows, orderRows);

  assertEqual(
    counts["promo-intro"],
    4,
    "promo-intro sums 2 subscriptions + 1 free + 1 order = 4 downloads"
  );
  assertEqual(
    counts["wedding-title"],
    2,
    "wedding-title sums 1 subscription + 1 order = 2 downloads"
  );
  assertEqual(
    counts["free-pack"],
    1,
    "free-pack sums 1 free download = 1 download"
  );
  assertEqual(
    counts["zero-downloads-item"],
    0,
    "zero-downloads-item returns 0 downloads"
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
