---
agent-notes: { ctx: "architecture phase tracking for celitecreators marketplace", deps: ["docs/tracking/2026-07-23-celitecreators-discovery.md", "docs/adrs/0003-r2-presigned-download-engine.md", "docs/adrs/0004-razorpay-server-actions-checkout.md", "docs/adrs/0005-supabase-rls-creator-buyer-roles.md"], state: active, last: "archie@2026-07-23" }
---

# Architecture: CeliteCreators Marketplace

**Date:** 2026-07-23
**Lead:** Archie
**Status:** Complete
**Prior Phase:** [docs/tracking/2026-07-23-celitecreators-discovery.md](file:///d:/cp/celitecreators.in/docs/tracking/2026-07-23-celitecreators-discovery.md)

## Key Decisions
- Chose Cloudflare R2 Presigned URLs with 15-minute TTL per request over direct proxying to ensure zero egress fees and high performance (ADR-0003).
- Chose Server Actions for Razorpay order initialization paired with idempotent database fulfillment functions across API verification routes and webhooks (ADR-0004).
- Chose Supabase RLS policies with dual-role user models protecting creator bank details while keeping public asset catalog reads index-optimized (ADR-0005).
- Created security threat model covering STRIDE risks, webhook HMAC integrity, and R2 file access (docs/security/threat-model.md).
- Created performance budget specifying Core Web Vitals (<1.5s LCP, <100ms INP) and media payload caps (<3MB video previews) (docs/performance-budget.md).

## Artifacts Produced
- `docs/adrs/0003-r2-presigned-download-engine.md`
- `docs/adrs/0004-razorpay-server-actions-checkout.md`
- `docs/adrs/0005-supabase-rls-creator-buyer-roles.md`
- `docs/security/threat-model.md`
- `docs/performance-budget.md`
- `docs/tracking/2026-07-23-celitecreators-debate.md`
- `docs/tracking/2026-07-23-celitecreators-architecture.md`

## Open Questions
- None. Architectural assessment and debate complete.

## Next Phase
- Phase 4: Acceptance Criteria (Pat)
