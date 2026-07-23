---
agent-notes: { ctx: "implementation plan for CeliteCreators marketplace", deps: ["2026-07-23-celitecreators-prd.md", "docs/product-context.md", "docs/tracking/2026-07-23-celitecreators-architecture.md"], state: active, last: "grace@2026-07-23" }
---

# Implementation Plan: CeliteCreators Marketplace

**Date:** 2026-07-23  
**Lead:** Grace & Tara  
**Target Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (Auth + Postgres), Cloudflare R2, Razorpay  

---

## Sprint Breakdown & Scope

### Sprint 1: Foundation, Database & Storage Setup
- Setup Next.js 16 App Router foundation with Tailwind v4 theme tokens (Sky Blue `#0284C7`, Obsidian `#090D16`, White `#FFFFFF`).
- Execute Supabase database migration script creating `creator_shops`, `templates`, `orders`, `order_items`, and `creator_payout_requests` with complete RLS security policies.
- Configure Cloudflare R2 S3 client helper (`@aws-sdk/client-s3`) and server-side presigned upload/download generator (`@aws-sdk/s3-request-presigner`).
- Generate TypeScript database types using Supabase MCP.

### Sprint 2: Creator Shop & 5-Step Asset Upload Portal
- Build Creator Registration & Bank KYC submission UI (`/creator/register`).
- Build Creator Public Shop Profile (`/creator/[slug]`) with custom banner, avatar, follower button, and asset catalog grid.
- Build 5-step Asset Upload Portal (`/creator/upload`):
  1. Basic Info & Category
  2. Pricing (in ₹ INR) & Licensing
  3. Media Previews (Image, H.264 Video, Audio)
  4. Direct R2 Source Zip Upload via Presigned URL
  5. Review & Submit (`status: pending`)
- Build Creator Dashboard (`/creator/dashboard`) displaying gross sales, commission split (80/20), and minimum ₹1,000 payout request trigger.

### Sprint 3: Home Page, Product Detail & 1-Click Razorpay Checkout
- Build Media-First Home Page (`/`) following Concept A "Studio Showcase" (glassmorphism, video hover loops, audio waveform cards, category pills).
- Build Category & Search Page (`/browse`, `/category/[slug]`) with software filters (After Effects, Premiere Pro, Blender, Figma).
- Build Product Detail Page (`/product/[slug]`) with interactive preview player and sticky buy bar.
- Build Razorpay Checkout integration:
  - Server Action creating Razorpay Order.
  - Razorpay Modal launch on client.
  - Verification API route (`POST /api/payments/razorpay/verify`) and Webhook route (`POST /api/payments/razorpay/webhook`) with HMAC SHA256 timing-safe comparison.
  - Presigned R2 download link delivery upon payment confirmation.

### Sprint 4: Admin Panel & End-to-End Verification
- Build Admin Moderation Portal (`/admin`):
  - Product Moderation (`/admin/products`): Review pending assets, inspect previews, approve/reject (`status: approved | rejected`).
  - Creator Verification (`/admin/creators`): Review creator KYC & manage direct upload permissions.
  - Payout Processing (`/admin/payouts`): Process pending payout requests and record bank transaction reference numbers.
  - Platform Analytics (`/admin/dashboard`): Platform gross sales volume, commission revenue, active shops.
- Execute automated integration tests (Vitest + RLS tests + HMAC verifier tests).
