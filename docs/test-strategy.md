---
agent-notes: { ctx: "test strategy and quality assurance guidelines", deps: ["2026-07-23-celitecreators-prd.md"], state: active, last: "tara@2026-07-23" }
---

# Test Strategy: CeliteCreators Marketplace

**Date:** 2026-07-23  
**Lead:** Tara  

---

## 1. Testing Pyramid & Coverage Targets

```
           / \
          / E2E \       <-- Playwright critical user flows (15% coverage target)
         /-------\
        /  Integ  \     <-- Supabase RLS, Razorpay Webhooks, R2 Presigned (35%)
       /-----------\
      /   Unit &    \   <-- Utility functions, price calculators, validation (50%)
     /  Component   \
    -----------------
```

- **Target Unit Test Coverage:** 80%+ on utility functions, payout split math, and validation schemas.
- **Target Integration Test Coverage:** 100% on payment HMAC verifiers, Supabase RLS policies, and R2 presigned URL generators.

---

## 2. Test Execution Plan

### Unit & Component Tests (Vitest + React Testing Library)
- Payout split calculation (80/20 & 70/30 split logic).
- Presigned URL expiry math (15-min TTL calculation).
- Form input schemas (Zod validation for upload metadata & KYC bank fields).

### Integration & API Tests
- Razorpay Webhook HMAC signature verification tests (valid signature vs. tampered payload).
- Supabase Row Level Security policy tests:
  - Verify unauthenticated user cannot read unapproved products (`status = 'pending'`).
  - Verify creator cannot read another creator's bank details (`bank_account_number`).
  - Verify non-owner cannot edit product rows.

### E2E Automation (Playwright)
- Creator onboarding & asset upload flow.
- Product page preview player interaction & checkout modal trigger.
- Admin approval & payout request processing workflow.
