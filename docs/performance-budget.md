---
agent-notes: { ctx: "performance targets and budget specs", deps: ["2026-07-23-celitecreators-prd.md"], state: active, last: "archie@2026-07-23" }
---

# Performance Budget: CeliteCreators Marketplace

**Date:** 2026-07-23  
**Lead:** Archie  

---

## 1. Core Web Vitals Targets (Mobile & Desktop)

- **Largest Contentful Paint (LCP):** < 1.5s
- **Interaction to Next Paint (INP):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.05
- **First Contentful Paint (FCP):** < 0.9s

---

## 2. Asset & Media Constraints (Concept A: Studio Showcase)

- **Video Previews (`celite-public`):**
  - Max video preview size: 3MB per clip.
  - Video format: H.264 / MP4 or WebM compressed at 1080p, muted autoplay on hover.
  - Preload policy: `preload="none"` by default; load streams on thumbnail hover.
- **Image Thumbnails:**
  - Format: Next.js `<Image />` with WebP / AVIF conversion.
  - Max uncompressed image payload: < 150KB.
- **Audio Previews:**
  - Format: MP3 128kbps, max size < 1MB.

---

## 3. Server Response & API Latency Budgets

- **Product Page Server Render (Next.js SSR):** < 200ms
- **Razorpay Order Creation Server Action:** < 300ms
- **R2 Presigned Download Link Generation:** < 150ms
- **Category Search & Filter Queries:** < 100ms (indexed Postgres queries)
