// agent-notes: { ctx: "TDD test for creator contact validation, red action bar missing check, and community constants", deps: ["lib/creatorValidation.ts"], state: active, last: "tara@2026-08-21" }
import {
  validateCreatorContact,
  isCreatorContactMissing,
  CREATOR_COMMUNITY_WHATSAPP_URL,
} from "../lib/creatorValidation";

function runTests() {
  console.log("=== RUNNING CREATOR CONTACT & COMMUNITY TESTS ===");
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

  // 1. WhatsApp Community URL Constant Check
  assertEqual(
    CREATOR_COMMUNITY_WHATSAPP_URL,
    "https://chat.whatsapp.com/Hr5lE9ATo4XHR0PwHVpdxn",
    "CREATOR_COMMUNITY_WHATSAPP_URL matches exact WhatsApp group invite link"
  );

  // 2. Phone Number & Email Validation
  assertEqual(
    validateCreatorContact("", "test@celitemarket.in").isValid,
    false,
    "Empty phone number fails validation"
  );

  assertEqual(
    validateCreatorContact("9876543210", "").isValid,
    false,
    "Empty email fails validation"
  );

  assertEqual(
    validateCreatorContact("123", "test@celitemarket.in").isValid,
    false,
    "Short invalid phone number (<10 digits) fails validation"
  );

  assertEqual(
    validateCreatorContact("9876543210", "invalid-email").isValid,
    false,
    "Invalid email format fails validation"
  );

  assertEqual(
    validateCreatorContact("9876543210", "creator@celitemarket.in").isValid,
    true,
    "Valid 10-digit Indian phone and standard email pass validation"
  );

  assertEqual(
    validateCreatorContact("+91 98765 43210", "creator.pro@gmail.com").isValid,
    true,
    "Formatted phone with country code and email pass validation"
  );

  // 3. Missing Contact Check for Creator Dashboard Red Action Bar
  assertEqual(
    isCreatorContactMissing({ phone: null, email: null }),
    true,
    "Null phone and null email is considered missing"
  );

  assertEqual(
    isCreatorContactMissing({ phone: "9876543210", email: null }),
    true,
    "Missing email is considered missing"
  );

  assertEqual(
    isCreatorContactMissing({ phone: "", email: "creator@celitemarket.in" }),
    true,
    "Empty phone string is considered missing"
  );

  assertEqual(
    isCreatorContactMissing({ phone: "   ", email: "creator@celitemarket.in" }),
    true,
    "Whitespace-only phone is considered missing"
  );

  assertEqual(
    isCreatorContactMissing({
      phone: "9876543210",
      email: "creator@celitemarket.in",
    }),
    false,
    "Complete phone and email is not missing (Red bar should NOT show)"
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runTests();
