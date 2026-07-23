---
agent-notes: { ctx: "ADR for Cloudflare R2 presigned download engine", deps: ["2026-07-23-celitecreators-prd.md"], state: active, last: "archie@2026-07-23" }
---

# ADR-0003: Cloudflare R2 Presigned Download Delivery Engine

## Status

Accepted (Debated & Confirmed)

## Context

CeliteCreators.in sells high-value digital asset source files (.zip, .psd, .aep, .blend) on a pay-per-product basis. Preventing unauthorized direct downloads while ensuring fast, reliable global downloads without proxying large files through Next.js server memory is critical.

## Decision

We will store private source files in a dedicated private Cloudflare R2 bucket (`celite-private`). Public preview assets (thumbnails, video clips, audio demos) will reside in a public R2 bucket (`celite-public`).

Download access to private source files will be delivered exclusively via server-side presigned URLs generated using `@aws-sdk/s3-request-presigner` S3 client. Presigned URLs will have a strict 60-minute expiration period and will only be generated after validating an order's `paid` status against the Supabase `orders` table.

## Consequences

### Positive

- Zero proxy overhead on Next.js servers; downloads are served directly by Cloudflare R2 edge nodes.
- Presigned URLs prevent bucket public exposure.
- Zero egress fees with Cloudflare R2 storage.

### Negative

- Presigned URLs can theoretically be shared within their 60-minute validity window.
- Requires server-side verification before signature generation.

### Mitigations (From Wei Debate)

- Limit presigned link validity to 60 minutes.
- Require authenticated session or order download token check before generating a presigned link.
