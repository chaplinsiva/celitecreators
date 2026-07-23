---
agent-notes: { ctx: "adversarial debate tracking for architectural decisions", deps: ["docs/adrs/0003-r2-presigned-download-engine.md", "docs/adrs/0004-razorpay-server-actions-checkout.md", "docs/adrs/0005-supabase-rls-creator-buyer-roles.md"], state: active, last: "wei@2026-07-23" }
---

# Architectural Debate: CeliteCreators Marketplace

**Date:** 2026-07-23  
**Challenged By:** Wei (Devil's Advocate)  
**Defended By:** Archie (Lead Architect)  
**Status:** Resolved & Incorporated  

---

## Debate 1: Cloudflare R2 Presigned URLs (ADR-0003)

- **Wei's Challenge (Scale Attack & Link Distribution):**
  > "Presigned R2 URLs valid for 60 minutes can easily be copied and shared on Telegram or Discord immediately after purchase, allowing hundreds of illegal downloads during that 1-hour window without paying."
- **Archie's Response & Mitigation:**
  > "Valid concern. Direct file proxying is expensive for bandwidth, but link sharing is a real risk. We will shorten the presigned link TTL to 15 minutes for individual download clicks. Additionally, presigned links will only be issued upon authenticating the user's purchase session or order token, reducing mass distribution windows while avoiding heavy server bandwidth proxies."
- **Outcome:** Resolution accepted. Updated ADR-0003 to 15-minute TTL per download request.

---

## Debate 2: Server Actions vs. Webhooks for Razorpay (ADR-0004)

- **Wei's Challenge (Race Conditions & Network Failures):**
  > "Relying on client-triggered verification routes (`POST /api/payments/razorpay/verify`) after Razorpay modal completion will fail if a mobile buyer closes their browser or loses internet right after paying. If the server action updates state separately from webhooks, we risk duplicate fulfillments or missing downloads."
- **Archie's Response & Mitigation:**
  > "Order fulfillment is strictly driven by an idempotent transaction in the database keyed on `razorpay_payment_id`. Both the verification endpoint and the async Webhook handler call the same idempotent function: `FULFILL_ORDER(order_id, payment_id)`. If the webhook arrives first or second, the state transition is atomic and idempotent."
- **Outcome:** Resolution accepted. Idempotent fulfillment function pattern documented in ADR-0004.

---

## Debate 3: Supabase RLS Query Performance (ADR-0005)

- **Wei's Challenge (Scale Attack on Public Catalog Queries):**
  > "Complex RLS policies checking owner IDs and shop status can slow down public catalog queries when millions of visitors browse `/browse` or category pages."
- **Archie's Response & Mitigation:**
  > "For public queries, the RLS policy for `templates` is a simple open check (`status = 'approved'`). We will add composite B-tree indexes on `(status, category_id, created_at)` and `(slug)`. Anonymous reads hit indexed rows directly without nested Subquery evaluations."
- **Outcome:** Resolution accepted. Indexes added to DB blueprint.
