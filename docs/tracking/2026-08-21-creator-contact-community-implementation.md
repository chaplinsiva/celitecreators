<!-- agent-notes: { ctx: "Tracking artifact for creator phone/email mandatory onboarding, missing info red bar, and community integration", deps: ["lib/creatorValidation.ts", "app/start-selling/page.tsx", "app/creator/dashboard/page.tsx"], state: complete, last: "sato@2026-08-21" } -->
# Tracking: Creator Contact Info (Phone & Email), Red Action Bar & WhatsApp Community

**Date:** 2026-08-21  
**Topic:** Creator Onboarding Mandatory Phone/Email, Red Action Bar for Incomplete Profiles, and WhatsApp Community Integration  
**Prior Phase:** Implementation Plan  

---

## Executive Summary
Implemented strict validation and collection of creator phone number and email during onboarding (`/start-selling`) and in Creator Studio Settings. Added database columns (`phone`, `email`, `joined_community`) to `creator_shops` in Supabase Postgres. Added an action red alert bar in the Creator Dashboard (`/creator/dashboard`) for existing creators missing contact information with 1-click navigation to fill details. Integrated the official Celite Creator Community WhatsApp link (`https://chat.whatsapp.com/Hr5lE9ATo4XHR0PwHVpdxn`) as a checkbox and CTA in onboarding, dashboard header, overview, and studio settings.

---

## What Was Built

### 1. Database Schema
- Altered `public.creator_shops` table to add:
  - `phone` (`TEXT`, nullable)
  - `email` (`TEXT`, nullable)
  - `joined_community` (`BOOLEAN`, default `FALSE`)

### 2. Validation & Helper Library (`lib/creatorValidation.ts`)
- `validateCreatorContact(phone, email)`: Enforces non-empty values, 10+ digit phone format, and valid RFC-compliant email formatting.
- `isCreatorContactMissing(shop)`: Detects if existing or newly fetched creator shop is missing phone or email.
- `CREATOR_COMMUNITY_WHATSAPP_URL`: Constant set to `https://chat.whatsapp.com/Hr5lE9ATo4XHR0PwHVpdxn`.

### 3. Backend APIs
- `app/api/creator/shop/update/route.ts`: Accepts and persists `phone`, `email`, and `joined_community` updates to Supabase.
- `app/api/creator/templates/route.ts`: Fetches `phone`, `email`, and `joined_community` in creator context payload.

### 4. Creator Onboarding (`app/start-selling/page.tsx`)
- Step 1: Added mandatory phone number and email fields with real-time validation before progressing to Step 2. Pre-populates email from logged-in Supabase session.
- Step 3: Added dedicated WhatsApp Community Join card with a direct link and a participation checkbox.
- Submits `phone`, `email`, and `joined_community` in the `creator_shops` upsert payload.

### 5. Creator Dashboard (`app/creator/dashboard/page.tsx`)
- **Action Red Bar**: Displays an eye-catching warning banner across the dashboard when a creator profile lacks phone or email, with an instant "Update Contact Details" button that navigates directly to the contact inputs.
- **WhatsApp Community CTA**: Embedded in the top navbar header, dashboard overview banner, and within Studio Settings.
- **Studio Settings Panel**: Added Contact Information section with Phone Number and Email fields for editing and updating anytime.
- **Payouts & Earnings Overview**: Resolved ₹0 balance issue by properly linking historical order items to creator shops with 80% revenue split, removing dummy subscription pool records, and showing Available Balance, Lifetime Earnings, and dynamic ₹800 Threshold Progress.

### 6. Product Page Approval Guard (`app/product/[slug]/page.tsx` & `lib/templateGuard.ts`)
- **Status Filter**: Enforced `.eq('status', 'approved')` in both `generateMetadata` and `ProductPage` server component.
- **404 Not Found**: Non-approved, pending, or rejected products now immediately return `notFound()` (404 page) to prevent rejected/unapproved templates from displaying publicly via direct slug URLs.
- **Checkout Protection**: Updated `app/checkout/page.tsx` and `app/api/purchase/route.ts` to block direct cart addition or checkout for non-approved templates.

### 7. Global Download Stats Harmonization (`lib/downloadStats.ts` & Category Pages)
- **Unified Download Aggregator**: Standardized batch download count calculation across `downloads` (subscriptions), `free_downloads`, and `order_items` (pay-per-product) using `getBatchTemplateDownloads(admin, slugs)`.
- **Chunked Queries**: Added 50-item chunking in `chunkArray` to prevent PostgREST URL length errors and guarantee exact counts for categories with hundreds of assets.
- **Synchronized Catalog Pages**: Integrated real download stats into:
  - `app/templates/page.tsx` & `app/templates/TemplatesClient.tsx`
  - `app/video-templates/[subcategorySlug]/page.tsx`
  - `app/video-templates/[subcategorySlug]/[subSubcategorySlug]/page.tsx`
  - `app/sound-effects/page.tsx`
  - `app/stock-musics/page.tsx`
  - `app/3d-models/page.tsx`
  - `app/stock-photos/page.tsx`
  - `app/web-templates/page.tsx`
  - `app/prompts/page.tsx`

### 8. Admin Template Approval Center Enhancement (`lib/adminApprovalHelpers.ts` & `VendorApprovalPanel.tsx`)
- **Status Filter Sub-Tabs**: Added interactive filter tabs to Marketplace Approvals:
  - **Pending Review** (with dynamic badge count)
  - **Approved (Live)** (with dynamic badge count)
  - **Rejected** (with dynamic badge count)
  - **All Submissions**
- **Re-Rejection & Re-Approval Controls**:
  - For **Approved Templates**: Added one-click **`✕ Reject Asset (Remove from Store)`** button, which updates `status = 'rejected'` and removes it immediately from public store pages (returning 404).
  - For **Rejected Templates**: Added **`✓ Re-Approve Asset (Make Live)`** button, allowing admins to restore unapproved or previously rejected templates.
  - For **Pending Templates**: Kept standard Dual Approval / Rejection options.
- **Search Filter**: Added instant template search input across template names, slugs, and creator names.

### 9. Admin Creator Shops & Payments Holding Panel (`lib/creatorShopDetails.ts`, `app/api/admin/creator-shops/route.ts`, `app/admin/components/UsersPanel.tsx`)
- **Creator Financial Holdings Aggregation**:
  - Implemented `aggregateCreatorFinancials` to compute exact gross revenue, net earnings (80%), paid out amounts, and currently held balances for each creator shop.
  - Added KPI overview cards: Total Creator Balance Held, Lifetime Creator Net, Total Paid Out, and Total Active Creator Shops.
- **Enhanced Creator Table**:
  - Displays Shop Name & Slug, Verified Contact details (Email, Phone, WhatsApp Community badge), Holding Balance in ₹, Sales Count & Net Earnings, and Template counts (Live vs Total).
  - Search filter across creator names, shop slugs, phone numbers, and emails.
- **Individual Creator Details Modal**:
  - One-click detailed inspector displaying comprehensive financial breakdown, WhatsApp community membership, payout destination (UPI ID or Bank IFSC), template portfolio with status indicators, and direct preview links.

---

## Test Results
- **Test Suite 1:** `scripts/test-creator-contact-community.ts` (12 passed / 12 tests)
- **Test Suite 2:** `scripts/test-creator-earnings.ts` (14 passed / 14 tests)
- **Test Suite 3:** `scripts/test-product-approval-guard.ts` (11 passed / 11 tests)
- **Test Suite 4:** `scripts/test-batch-download-stats.ts` (8 passed / 8 tests)
- **Test Suite 5:** `scripts/test-admin-approval-workflow.ts` (17 passed / 17 tests)
- **Test Suite 6:** `scripts/test-creator-shop-details.ts` (14 passed / 14 tests)
- **Total:** 76 tests passed, 0 failed
- **TDD Cycle:** Red → Green → Refactor complete.
