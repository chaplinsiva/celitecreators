---
agent-notes: { ctx: "complete database schema planning for 12 core tables, RLS policies, triggers, and type sync", deps: ["docs/product-context.md", "2026-07-23-celitecreators-prd.md", "supabase/migrations/20260723_init_schema.sql", "src/types/database.ts"], state: active, last: "grace@2026-07-24" }
---

# Implementation Plan: Database Schema & Complete Table Architecture

**Date:** 2026-07-24  
**Lead:** Grace (Project Operations) & Archie (Architecture Lead)  
**Status:** Planning / Architecture Gate Required  

---

## 1. Goal

Design and migrate the full production database schema for **CeliteCreators Marketplace**, extending initial 7 tables to a robust 12-table architecture supporting creator shops, asset uploads, 1-click Razorpay single-product checkout, R2 presigned downloads, buyer follower systems, 5-star verified reviews, wishlist items, user role profiles, and presigned download security audit logging.

---

## 2. Constraints

- **Database Engine:** Supabase Postgres 15+ with `uuid-ossp` / `gen_random_uuid()`.
- **Security:** Strict Row Level Security (RLS) enabled on all tables.
- **Type Safety:** 100% synchronized TypeScript types in [database.ts](file:///d:/cp/celitecreators.in/src/types/database.ts).
- **Performance Budget:** Performance indexes required for query execution (< 1.5s LCP storefront budget).

---

## 3. Architecture Gate Items

> [!IMPORTANT]
> **Requires Architecture Gate:** ADR 0006 + Wei debate before implementation.
> 
> **Reason:** This work introduces 5 new entities (`user_profiles`, `creator_followers`, `reviews`, `wishlists`, `download_logs`), schema updates to 4 existing tables (`creator_shops`, `templates`, `orders`, `order_items`), database triggers (`handle_new_user`, `update_creator_followers_count`, `update_template_rating`), and complete RLS policy matrix. It establishes core data ownership rules across buyer, creator, and admin roles.

---

## 4. Implementation Approach (Phased TDD)

### Phase 2: Architecture & ADR Gate
1. **Write ADR 0006 (`docs/adrs/0006-complete-database-schema-expansion.md`)**:
   - Define entity relationship blueprint, foreign key constraints, JSONB column structures (`software`, `plugins`, `tags`, `gallery_paths`), RLS security rules, and database trigger behavior.
2. **Archie vs Wei Adversarial Review**:
   - Debate role-based access vs user profiles schema, guest checkout handling (`user_id IS NULL`), order revenue split fields (`platform_fee`, `creator_earnings`), and follower/rating counter atomicity.

### Phase 3: TDD Implementation
1. **Failing Schema Tests (Red)**:
   - Create [schema.test.ts](file:///d:/cp/celitecreators.in/src/__tests__/schema.test.ts) verifying TypeScript table structures, required fields, and enum types.
2. **Migration File Creation (Green)**:
   - Create migration `supabase/migrations/20260724_expanded_schema.sql` (or update init schema) with full table definitions, indexes, RLS policies, and triggers.
3. **TypeScript Definition Sync**:
   - Update [database.ts](file:///d:/cp/celitecreators.in/src/types/database.ts) to match expanded schema 1:1.
4. **Refactor & Verification**:
   - Execute Vitest suite (`npx vitest run`) and TypeScript check (`npx tsc --noEmit`).

---

## 5. Personas Involved

- **Grace (Lead):** Sprint planning and task coordination.
- **Archie (Architecture):** ADR 0006 drafting and schema design.
- **Wei (Adversarial Advocate):** Security & RLS threat modeling review.
- **Tara (QA & Testing):** Red failing tests for schema contracts.
- **Sato (Implementation):** SQL migration creation and TypeScript sync.

---

## 6. Open Questions & User Review

1. **Devcontainer Check:** No `.devcontainer/devcontainer.json` is currently configured. Would you like to set up a devcontainer environment now (`/devcontainer`), or proceed with local environment toolchain?
2. **Admin Role Assignment:** Do we want user profiles to default to `'buyer'`, with admin roles assigned via Supabase dashboard / metadata flag? (Recommended: Default `'buyer'`, admin elevated via `user_profiles.role`).

---

## 7. Acceptance Criteria

1. All 12 core tables created with foreign keys, ON DELETE CASCADE/SET NULL rules, and default timestamps.
2. RLS policies enabled and verified on all 12 tables for buyer, creator, and admin access boundaries.
3. Automated database triggers functioning for user profile generation, follower counts, and review average ratings.
4. TypeScript interface `Database` in [database.ts](file:///d:/cp/celitecreators.in/src/types/database.ts) updated with zero type errors (`npx tsc --noEmit`).
5. Vitest tests pass cleanly for schema integrity and helper mappings.
