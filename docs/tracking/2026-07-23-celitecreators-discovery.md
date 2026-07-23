---
agent-notes: { ctx: "discovery tracking for celitecreators marketplace", deps: ["2026-07-23-celitecreators-prd.md"], state: active, last: "cam@2026-07-23" }
---

# Discovery: CeliteCreators Marketplace

**Date:** 2026-07-23
**Lead:** Cam
**Status:** Complete
**Prior Phase:** None

## Key Decisions
- Chose direct single-product pay-per-item model over subscription model to cater to buyers needing standalone digital assets without recurring fees.
- Chose Next.js 16 (App Router), React 19, Supabase (Auth + Postgres), Cloudflare R2, and Razorpay as core stack.
- Chose instant 1-click single-product Razorpay checkout flow launching modal directly from product page.
- Chose Cloudflare R2 presigned URLs generated server-side with 60-minute expiry for zero asset leakage.
- Chose admin moderation approval (`status: pending`) for newly uploaded creator assets, with optional `direct_upload_enabled` override for trusted shops.
- Chose manual/batch payout requests processing (minimum threshold ₹1,000) using registered bank/UPI details for MVP.

## Artifacts Produced
- `docs/tracking/2026-07-23-celitecreators-discovery.md`

## Open Questions
- None. Vision and scope confirmed by human.

## Next Phase
- Phase 1b: Human Model Elicitation (Pat)
