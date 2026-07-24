---
agent-notes: { ctx: "human product philosophy and proxy guidance for white light theme", deps: ["docs/tracking/2026-07-23-celitecreators-discovery.md"], state: active, last: "pat@2026-07-23" }
---

# Product Context & Human Model

## Product Philosophy & Decision Profile
- **Quality vs. Speed:** **High Polish** (Option B). Prioritize premium visual aesthetics, crisp light glassmorphism, micro-animations, and rich polish from day one.
- **Scope Appetite:** **Extended Scope** (Option B). Include full creator shop customization (`/creator/[slug]`), follower system, verified buyer reviews/ratings, and detailed monthly earnings analytics alongside core 1-click single-product checkout.
- **Risk Tolerance & Tech Stack:** **Cutting Edge** (Option A). Embrace Next.js 16 App Router Server Actions, React 19, and Tailwind CSS v4.
- **Design System & Palette:**
  - Theme Style: **Crisp White Light Theme**
  - Primary Accent: Sky Blue (`#0284C7` / `#0099FF`)
  - Base Background: Pure White (`#FFFFFF`) & Soft Off-White Slate (`#F8FAFC`)
  - Typography & Headings: High-Contrast Dark Slate (`#0F172A` / `#090D16`)
  - Cards & Panels: White glassmorphic cards with soft borders (`#E2E8F0`) and ambient shadows (`rgba(15, 23, 42, 0.05)`).

## Tooling & Integration Directives
- **Stitch MCP Server (`stitch`):** Utilize `stitch` MCP for UI design systems, screen concepts, and component variants in Crisp White Light Mode.
- **Supabase MCP Server (`supabase`):** Utilize `supabase` MCP for database schema management, SQL executions, table listing, and TypeScript type generation.

## Proxy Rules for Pat
- When trade-offs arise between quick shipping and visual polish, choose visual polish and rich user experience.
- When architectural decisions arise, favor Next.js 16 App Server Actions and modern React 19 capabilities.
- Keep security (presigned R2 download tokens expiring in 15 min) strict and non-negotiable.
