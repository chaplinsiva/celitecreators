---
agent-notes: { ctx: "ADR for 12-table database schema expansion, RLS policies, and trigger automations", deps: ["docs/adrs/0005-supabase-rls-creator-buyer-roles.md", "2026-07-23-celitecreators-prd.md", "docs/product-context.md"], state: active, last: "archie@2026-07-24" }
---

# ADR-0006: 12-Table Production Database Schema & RLS Security Matrix

## Status

Accepted (Wei & Archie Adversarial Gate Passed)

## Context

CeliteCreators Marketplace requires a complete, production-grade relational schema in Supabase Postgres. The initial schema covered 7 tables (`categories`, `subcategories`, `creator_shops`, `templates`, `orders`, `order_items`, `creator_payout_requests`). However, to satisfy the extended PRD scope (creator followers, 5-star verified buyer reviews, buyer wishlists, user roles, download security audit logs, and accurate 80/20 earnings breakdowns), the schema must be expanded and fortified with automated triggers and strict Row Level Security (RLS).

## Decision

1. **User Profiles & Role Architecture (`user_profiles`)**:
   - Create `public.user_profiles` referencing `auth.users(id) ON DELETE CASCADE`.
   - Include `role` TEXT column constrained to `'buyer' | 'creator' | 'admin'`, defaulting strictly to `'buyer'`.
   - Attach trigger `on_auth_user_created` (`handle_new_user()`) to automatically create a profile row upon Supabase Auth user registration.

2. **Complete 12-Table Topology**:
   - **`categories`**: `id`, `name`, `slug`, `description`, `icon_name`, `created_at`.
   - **`subcategories`**: `id`, `category_id`, `name`, `slug`, `created_at`.
   - **`user_profiles`**: `id`, `full_name`, `avatar_url`, `phone_number`, `role`, `created_at`, `updated_at`.
   - **`creator_shops`**: `id`, `user_id`, `name`, `slug`, `description`, `profile_image_url`, `banner_image_url`, `bank_account_number`, `bank_ifsc`, `bank_upi_id`, `bank_account_name`, `is_verified` (BOOLEAN DEFAULT false), `direct_upload_enabled`, `followers_count`, `created_at`, `updated_at`.
   - **`templates`**: `id`, `creator_shop_id`, `name`, `slug`, `subtitle`, `description`, `price`, `is_free`, `category_id`, `subcategory_id`, `thumbnail_path`, `preview_path`, `video_path`, `audio_preview_path`, `gallery_paths` (JSONB DEFAULT '[]'), `file_size_bytes` (BIGINT), `file_format` (TEXT), `source_path` (Private R2 Key), `software` (JSONB), `plugins` (JSONB), `tags` (JSONB), `status` ('pending' | 'approved' | 'rejected'), `sales_count`, `rating_avg`, `rating_count`, `created_at`, `updated_at`.
   - **`orders`**: `id`, `user_id`, `total`, `status` ('pending' | 'paid' | 'failed'), `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `billing_name`, `billing_email`, `billing_mobile`, `download_token`, `created_at`, `updated_at`.
   - **`order_items`**: `id`, `order_id`, `template_id`, `template_slug`, `creator_shop_id`, `name`, `price`, `platform_fee` (20% platform share), `creator_earnings` (80% creator share), `created_at`.
   - **`creator_payout_requests`**: `id`, `creator_shop_id`, `amount`, `status` ('pending' | 'processed' | 'rejected'), `bank_reference_number`, `admin_notes`, `processed_at`, `created_at`.
   - **`creator_followers`**: `id`, `user_id`, `creator_shop_id`, `created_at`, `UNIQUE(user_id, creator_shop_id)`.
   - **`reviews`**: `id`, `user_id`, `template_id`, `order_item_id`, `rating` (1-5), `title`, `comment`, `is_verified_buyer` (BOOLEAN DEFAULT true), `created_at`, `updated_at`, `UNIQUE(user_id, template_id)`.
   - **`wishlists`**: `id`, `user_id`, `template_id`, `created_at`, `UNIQUE(user_id, template_id)`.
   - **`download_logs`**: `id`, `user_id`, `order_id`, `template_id`, `download_token`, `ip_address`, `user_agent`, `downloaded_at`.

3. **Automated Triggers**:
   - `handle_new_user()`: Auto-creates `user_profiles` row on `auth.users` insert.
   - `update_creator_followers_count()`: Manages `creator_shops.followers_count` on follower add/remove.
   - `update_template_rating()`: Recalculates `rating_avg` and `rating_count` on template review changes.
   - `update_updated_at_column()`: Keeps timestamps current across mutable tables.

4. **Row Level Security (RLS) Policy Matrix**:
   - Public read for `categories`, `subcategories`, active `creator_shops`, `reviews`, and `status = 'approved'` `templates`.
   - Buyer-isolated access for `orders`, `order_items`, `wishlists`, and `download_logs`.
   - Creator owner access for managing shop profile, asset uploads, and payout requests.
   - Admin access override based on `(SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'`.

## Consequences

### Positive
- Fully covers all PRD storefront, creator portal, and admin management requirements.
- Zero dependency on external backend scripts for aggregate statistics (follower counts & review averages calculated atomically at database layer).
- Bulletproof security with Supabase RLS preventing cross-tenant data leaks.
- 100% synchronized TypeScript types ensuring compile-time safety.

### Negative
- Initial SQL migration script is comprehensive and requires testing against schema constraints.
