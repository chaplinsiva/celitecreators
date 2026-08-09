<!-- For a human-readable overview, see README.md and docs/template-guide.md -->
# AGENTS.md — Project Instructions for Antigravity

## Project Overview

**Project Name:** CeliteMarket (Pay-Per-Product Marketplace)  
**Live Production Domain:** `https://celitemarket.in`  
**Description:** Pay-Per-Product Digital Asset Marketplace for Digital Creators in India (Video Editors, 3D Artists, Sound Engineers, Graphic Designers).  
**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (Auth & Postgres), Cloudflare R2, Razorpay  
**Repository:** `https://github.com/chaplinsiva/celitecreators`  

**Codebase Map:** `docs/code-map.md` — read this first to understand package structure, APIs, and data flow.

---

## Design & Aesthetic Directives
- **Primary Accent:** Sky Blue (`#0284C7` / `#0099FF`)
- **Base Background:** Deep Dark Studio (`#0B0F17` / `#090D16`)
- **Card Containers:** `#090D16` Dark Glassmorphic Cards with `#0F172A` Sub-cards & Light/Slate Borders (`border-slate-800`).
- **Typography & High Contrast:** Crisp Pure White (`text-white`), Sky Blue Highlights (`text-sky-400`), and Subtle Slate (`text-slate-300` / `text-slate-400`).
- **UX Style:** Concept A "Studio Showcase" (Dark Edition) — media-first layout with interactive preview players, hover video loops, audio visualizers, and sticky 1-click Razorpay purchase drawers.

---

## Core Business Model Directives (Pay-Per-Product & Lifetime Access)
- **Pay-Per-Product Purchasing:** Celite Market operates on a strict single-asset / cart purchase model. All subscription-related UI components (plan cards, subscription status badges, subscription management modals) are removed.
- **Automated Purchase Email Delivery:** Upon successful Razorpay payment verification (`app/api/payments/razorpay/verify/route.ts`), an immediate confirmation email is sent (`lib/emailService.ts`) with direct product download links (`https://celitemarket.in/product/[slug]`).
- **Perpetual Lifetime Access:** Buyers retain permanent re-download access for purchased assets via the product page ("Re-Download File" CTA) and User Dashboard ("My Lifetime Purchased Assets").

---

## MCP Server Integrations (MANDATORY TOOLING)
- **Supabase MCP Server (`supabase`):** Utilized for database schema management, table listings, SQL execution, migrations, edge functions, and TypeScript type generation.
- **Stitch MCP Server (`stitch`):** Utilized for UI screen generation, design system configuration, layout variants, and visual explorations.

---

## Agent-Notes Protocol (MANDATORY)

Every non-excluded code and documentation file MUST include agent-notes metadata. See `docs/methodology/agent-notes.md` for spec.

1. **New Files:** Include agent-notes block comment `/* agent-notes: ... */` in TS/JS/SQL or `<!-- agent-notes: ... -->` in Markdown.
2. **Edits:** Update `last` to `<agent>@<date>`.
3. **Fields:** `ctx` under 10 words, `deps` = direct dependencies, `state` = `active`.

---

## Team & Process

**Methodology:** Phase-dependent hybrid teams. See `docs/methodology/phases.md` for the 7-phase model.

| Phase | Lead | Key Pattern |
|---|---|---|
| Discovery | Cam | Elicit vision & pressure-test assumptions |
| Product & Scope | Pat | Human model alignment (`docs/product-context.md`) |
| Architecture | Archie | Write ADR before implementation code |
| Security | Pierrot | Threat modeling & STRIDE analysis (`docs/security/threat-model.md`) |
| Implementation | Tara → Sato | Strict TDD (Red → Green → Refactor) |
| Code Review | Vik + Tara + Pierrot | Three parallel review lenses |
| Project Operations | Grace | GitHub board management & sprint boundaries |

---

## Critical Rules

### 1. Session Entry Protocol (Mandatory)
Before writing any implementation code:
1. **Do work items exist for this work?** If no → create them via GitHub Projects adapter.
2. **Does this work involve an architectural decision?** If yes → Architecture Gate (Archie + Wei adversarial debate).
3. **Am I about to write implementation code?** If yes → Tara writes failing tests first.

### 2. Don't Skip Agents
When human requests team/persona involvement, spawn named agents as standalone subagents using the Task tool. Inline self-analysis is not a substitute for agent invocation.

### 3. ADR Before Implementation
Never implement features with pending architectural choices without writing an ADR in `docs/adrs/` first.

---

## Development Workflow

### Per Work Item
1. **Start** — Move issue to **"In Progress"** on the project board before writing code.
2. **TDD** — Write failing test → Implement solution → Refactor (`npm test`).
3. **Commit** — Conventional commits format (`feat(...)`, `fix(...)`, `Closes #N`).
4. **Review** — Move issue to **"In Review"** and run code review.
5. **Done Gate** — Pass 15-item Done Gate checklist (`docs/process/done-gate.md`).
6. **Close** — Move issue to **"Done"** on the board and push to `origin main`.

---

## Tracking & Project Board

<!-- tracking-adapter: github-projects -->
<!-- project-number: 1 -->
<!-- project-owner: chaplinsiva -->
<!-- project-node-id: PVT_kwHOChu3w84BePIc -->
<!-- status-field-id: PVTSSF_lAHOChu3w84BePIczhYq2gA -->
<!-- status-option-backlog: 403ac189 -->
<!-- status-option-ready: 6e9f26a5 -->
<!-- status-option-in-progress: 2eaf2cea -->
<!-- status-option-in-review: 0721215d -->
<!-- status-option-done: 9993ffd2 -->

**Status Flow:** Backlog → Ready → In Progress → In Review → Done

---

## Process Docs Index

| Doc | Purpose |
|---|---|
| `docs/product-context.md` | Human product philosophy, visual guidelines, and proxy rules |
| `docs/adrs/` | Architecture Decision Records (R2 Presigned, Razorpay, RLS) |
| `docs/security/threat-model.md` | STRIDE security threat analysis & HMAC verifiers |
| `docs/performance-budget.md` | Core Web Vitals targets (<1.5s LCP, <100ms INP) |
| `docs/test-strategy.md` | Quality assurance targets and test execution strategy |
| `docs/tech-debt.md` | Active technical debt register |
| `docs/tracking/` | Phase tracking decision logs |

---

## Project Structure

```
.
├── AGENTS.md                 # Project instructions & tracking metadata
├── docs/
│   ├── adrs/                 # Architecture Decision Records (0001 - 0005)
│   ├── plans/                # Implementation plans
│   ├── security/             # Security threat models & STRIDE matrix
│   ├── tracking/             # Workflow phase tracking artifacts
│   ├── product-context.md    # Human product philosophy & proxy guidance
│   ├── performance-budget.md # Core Web Vitals & media payload caps
│   ├── test-strategy.md      # Test coverage targets & strategy
│   └── tech-debt.md          # Technical debt register
├── src/
│   ├── app/                  # Next.js 16 App Router (Storefront, Creator, Admin)
│   ├── lib/                  # Core helpers (r2.ts, razorpay.ts, payout.ts, supabase.ts)
│   └── types/                # TypeScript definitions (database.ts, marketplace.ts)
├── supabase/
│   ├── migrations/           # Supabase SQL schema & RLS security policies
│   └── seed.sql              # Initial marketplace category seed data
└── vitest.config.ts          # Vitest unit testing configuration
```
