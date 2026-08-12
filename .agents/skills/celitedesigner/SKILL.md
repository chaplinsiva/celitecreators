---
name: celitedesigner
description: Cinematic Media Marketplace UI design guidelines, core design principles, and visual identity standards.
agent-notes: { ctx: "cinematic media marketplace UI design system", deps: [AGENTS.md, docs/product-context.md], state: active, last: "antigravity@2026-08-11" }
---

# Skill: Cinematic Media Marketplace UI

## Purpose

Design and build a premium media-asset marketplace for:
- Adobe After Effects assets
- Premiere Pro assets
- Motion graphics
- Transitions
- Presets
- Templates
- LUTs
- Sound effects
- Video assets
- 3D assets

The visual direction is:

**Cinematic Dark Spatial UI**
= dark cinematic foundation + electric blue brand accent + subtle glass surfaces + spatial depth + purposeful motion.

The product should feel like a professional creative tool and premium marketplace, NOT a generic SaaS dashboard, gaming site, crypto site, or AI landing page.

---

# 1. Core Design Principles

## Primary principle

Content is the hero.

For a media marketplace:

> The asset preview is more important than the UI decoration.

Prioritize:
1. Asset preview
2. Search/discovery
3. Filtering
4. Asset metadata
5. Purchase/download actions
6. Creator identity
7. Visual polish

Never allow decorative UI effects to interfere with browsing assets.

---

# 2. Visual Identity

## Base colors

Use near-black rather than pure black.

```css
--bg: #08090C;
--bg-secondary: #0D1016;
--surface: #12151C;
--surface-hover: #181D27;

--text-primary: #F5F7FA;
--text-secondary: #8B93A1;

--brand-blue: #2563FF;
--brand-blue-bright: #3B82FF;

--border: rgba(255,255,255,0.08);
--blue-glow: rgba(37,99,255,0.20);
```
