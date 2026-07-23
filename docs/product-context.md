---
agent-notes: { ctx: "human product philosophy and proxy guidance", deps: ["docs/tracking/2026-07-23-celitecreators-discovery.md"], state: active, last: "pat@2026-07-23" }
---

# Product Context & Human Model

## Product Philosophy & Decision Profile
- **Quality vs. Speed:** **High Polish** (Option B). Prioritize premium visual aesthetics, vibrant glassmorphism, micro-animations, and rich polish from day one.
- **Scope Appetite:** **Extended Scope** (Option B). Include full creator shop customization (`/creator/[slug]`), follower system, verified buyer reviews/ratings, and detailed monthly earnings analytics alongside core 1-click single-product checkout.
- **Risk Tolerance & Tech Stack:** **Cutting Edge** (Option A). Embrace Next.js 16 App Router Server Actions, React 19, and Tailwind CSS v4.
- **Design System & Palette:**
  - Primary Accent: Sky Blue (`#0284C7` / `#00A3FF`)
  - Neutral Light: Crisp White (`#FFFFFF` / `#F8FAFC`)
  - Base Dark: Deep Obsidian / Black (`#090D16` / `#0F172A`)
  - Aesthetic Style: Sleek dark mode, vibrant sky-blue glow accents, modern typography, responsive cards, dynamic hover micro-animations.

## Tooling & Integration Directives
- **Stitch MCP Server (`stitch`):** Utilize `stitch` MCP for UI design systems, screen concepts, and component variants.
- **Supabase MCP Server (`supabase`):** Utilize `supabase` MCP for database schema management, SQL executions, table listing, and TypeScript type generation.

## Proxy Rules for Pat
- When trade-offs arise between quick shipping and visual polish, choose visual polish and rich user experience.
- When architectural decisions arise, favor Next.js 16 App Server Actions and modern React 19 capabilities.
- Keep security (presigned R2 download tokens expiring in 60 min) strict and non-negotiable.
