---
agent-notes: { ctx: "ADR for Supabase database schema and RLS security model", deps: ["2026-07-23-celitecreators-prd.md"], state: active, last: "archie@2026-07-23" }
---

# ADR-0005: Supabase RLS & Dual-Role Schema Architecture

## Status

Accepted (Debated & Confirmed)

## Context

The marketplace serves two distinct user roles: Buyers (purchasing assets and downloading source files) and Creators (managing shop profiles, uploading assets, viewing earnings, and requesting payouts). We need strong security boundaries using Supabase Row Level Security (RLS).

## Decision

1. **Dual Role Model:** Supabase Auth handles user identity. A user becomes a Creator by registering a entry in `public.creator_shops` linked to `auth.users.id`.
2. **Row Level Security (RLS) Rules:**
   - `templates` table: Public `SELECT` allowed only where `status = 'approved'`. Creators have full `INSERT`/`UPDATE` access restricted strictly to rows where `creator_shop_id` matches their own shop.
   - `creator_shops` table: Public `SELECT` allowed for shop profile fields (name, bio, avatar, banner). Sensitive bank details (`bank_account_number`, `bank_ifsc`, `bank_upi_id`) are protected by RLS so ONLY the shop owner or admin role can read them.
   - `orders` & `order_items`: Users can only read their own order records (`user_id = auth.uid()`).
   - `creator_payout_requests`: Creators can only insert/select payout requests for their own `creator_shop_id`.

## Consequences

### Positive

- Strong data isolation directly at the database engine level.
- Bank account details and private metadata cannot be scraped or accessed via public REST/GraphQL APIs.
- Clean separation between public store catalog and private dashboard data.

### Negative

- Complex RLS policies require thorough test coverage.
