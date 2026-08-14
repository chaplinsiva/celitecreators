---
agent-notes:
  ctx: "ADR for Pay-Per-Product Attribution & Analytics System on CeliteMarket"
  deps: ["lib/attribution.ts", "components/AttributionTracker.tsx", "app/api/attribution/sync/route.ts", "app/api/admin/analytics/attribution/route.ts"]
  state: active
  last: "sato@2026-08-14"
---

# ADR 0006: Marketplace Pay-Per-Product Attribution & Analytics System

## Status
Accepted

## Context
Understanding the marketing source and touchpoint history of paying customers is critical for optimizing ad spend across Meta (Instagram/Facebook), Google Ads, YouTube, SEO, and AI channels. CeliteMarket operates on a Pay-Per-Product marketplace model where users browse creative assets, add them to cart, and purchase lifetime access. We required a robust, database-backed, financial-grade attribution tracking and analytics architecture.

## Decision
1. **Client-Side Touchpoint Capture**:
   - `lib/attribution.ts` captures UTM parameters, `gclid`, `fbclid`, referring domains, landing pages, and product page views (`/product/[slug]`).
   - Normalizes traffic into 11 standardized channels with strict hierarchical evaluation.
   - Enforces first-touch discovery immutability while updating last-touch conversion drivers and incrementing touchpoint counts in `localStorage`.
2. **Anonymous to Authenticated Sync**:
   - `<AttributionTracker />` listens to route transitions and auth state changes, syncing visitor journeys to `public.visitor_attributions` via `/api/attribution/sync` and `/api/checkout/details`.
3. **Immutable Financial Purchase Snapshots**:
   - On successful Razorpay payment verification in `/api/payments/razorpay/verify`, an immutable snapshot is stamped into `public.order_attributions`, preserving historical attribution permanently.
4. **Admin Dashboard Intelligence**:
   - `/api/admin/checkout-logs` enriched with first-touch / last-touch badges, campaign tags, and an interactive **Customer Journey modal (`Discovery ➔ Conversion`)**.
   - `/api/admin/analytics/attribution` & `AttributionAnalyticsPanel` provides high-level ROI analysis, First vs Last touch toggle, UTM campaign tracking, product discovery rankings, assisted conversion paths, and CSV export.

## Consequences
- **Pros**: 100% database-backed, no reliance on third-party cookie trackers, financial-grade accuracy, instant visibility in the admin portal.
- **Cons**: Requires initial storage in localStorage until identity stitching occurs on login or checkout.
