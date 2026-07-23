---
agent-notes: { ctx: "initial threat model analysis for celitecreators marketplace", deps: ["2026-07-23-celitecreators-prd.md", "docs/adrs/0003-r2-presigned-download-engine.md"], state: active, last: "pierrot@2026-07-23" }
---

# Threat Model: CeliteCreators Marketplace

**Date:** 2026-07-23  
**Lead Security Reviewer:** Pierrot  
**Scope:** Single-product checkout, Cloudflare R2 storage delivery, Razorpay webhooks, Supabase RLS, Bank KYC data.

---

## 1. System Data Flow & Trust Boundaries

```
[ Unauthenticated / Authenticated Buyer ] ──(HTTPS)──> [ Next.js App Router (Vercel/Edge) ]
                                                               │         │
                                                       (Auth & │         │ (SDK Orders)
                                                         RLS)  ▼         ▼
                                                    [ Supabase DB ]   [ Razorpay Gateway ]
                                                                         │
                                                                         │ (Webhook SHA256)
                                                                         ▼
                                                              [ Next.js Webhook Route ]
                                                                         │
                                                                 (Generate Presigned)
                                                                         ▼
                                                                [ Cloudflare R2 ]
```

---

## 2. Threat Analysis (STRIDE Matrix)

| Threat Category | Asset / Target | Threat Scenario | Mitigation / Countermeasure |
| :--- | :--- | :--- | :--- |
| **Spoofing** | Razorpay Webhooks | Attacker sends fake `payment.captured` webhooks to trigger asset delivery without paying. | Mandatory HMAC-SHA256 signature verification (`crypto.timingSafeEqual`) using secret key. |
| **Tampering** | R2 Source Files | Creator uploads malicious files or executable payloads instead of `.zip` assets. | Extension whitelist enforcement, size caps (max 2GB), client-side & server-side validation. |
| **Information Disclosure** | Creator Bank KYC | Attacker queries Supabase API to harvest creators' bank account numbers & UPI IDs. | Strict Supabase RLS hiding bank fields from public `SELECT`; only accessible by owner or service role. |
| **Information Disclosure** | R2 Source URLs | Buyer shares presigned R2 download link on public forums/Discord. | 60-minute presigned URL TTL + signature verification + rate limiting. |
| **Repudiation** | Creator Payouts | Creator claims they were not paid for a completed sale. | Transactional audit log in `creator_payout_requests` storing Razorpay payout ID / bank reference. |
| **Elevation of Privilege** | Asset Publishing | Unapproved creator bypasses admin review to publish unsafe assets. | Database RLS policy restricting public visibility to `status = 'approved'`. Direct upload override default `false`. |

---

## 3. Security Requirements Checklist
- [x] R2 private bucket permissions (`celite-private`) disabled for public access.
- [x] Razorpay HMAC signature comparison using timing-safe function.
- [x] Supabase RLS policies enforced on all tables.
- [x] Environmental secrets (`RAZORPAY_SECRET`, `R2_SECRET_ACCESS_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) stored exclusively in server environment variables.
