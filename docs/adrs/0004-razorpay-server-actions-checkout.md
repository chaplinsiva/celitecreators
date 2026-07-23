---
agent-notes: { ctx: "ADR for Razorpay checkout & payment verification architecture", deps: ["2026-07-23-celitecreators-prd.md"], state: active, last: "archie@2026-07-23" }
---

# ADR-0004: Razorpay Checkout & Webhook Verification Architecture

## Status

Accepted (Debated & Confirmed)

## Context

CeliteCreators requires a low-friction 1-click single-product purchase flow using Razorpay in INR (₹). We need to handle order creation securely, avoid client-side payment forgery, and ensure order fulfillment is reliable even if the buyer closes their browser after payment.

## Decision

1. **Order Initiation:** Use Next.js 16 Server Actions to initiate Razorpay Orders on the server side using official `razorpay` SDK, returning order metadata (`order_id`, `amount`, `currency`, `key_id`) to the client.
2. **Client Checkout:** Render the Razorpay Checkout Modal directly on the product detail page (`/product/[slug]`).
3. **Payment Verification & Fulfillment:** Payment verification will execute server-side via both an API verification route (`POST /api/payments/razorpay/verify`) for immediate UI redirection AND an asynchronous Webhook handler (`POST /api/payments/razorpay/webhook`).
4. **Idempotency:** Order updates in Supabase `orders` table will use idempotent transaction logic checking `razorpay_payment_id`.

## Consequences

### Positive

- Low latency order creation via Server Actions.
- Immune to client-side price modification or payment forgery.
- Webhook fallback guarantees order fulfillment even if the user's network drops post-payment.

### Negative

- Dual handling (Verification Route + Webhook) requires strict database idempotency logic.
