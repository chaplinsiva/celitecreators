---
agent-notes: { ctx: "Stitch MCP high-fidelity UI design prompt text suite for white light theme", deps: ["2026-07-23-celitecreators-prd.md", "docs/product-context.md"], state: active, last: "dani@2026-07-23" }
---

# Stitch MCP UI Design Prompt Suite — CeliteCreators Marketplace (Light Theme Edition)

**Target Tool:** Stitch MCP (`generate_screen_from_text`, `generate_variants`, `create_project`)  
**Design System:** Crisp White Light Theme (`#FFFFFF` / `#F8FAFC`), Dark Slate Typography (`#0F172A`), Sky Blue Accent (`#0284C7`)  

---

## 1. Storefront Home Page (`/`) Prompt

```text
Design a high-impact, media-first homepage for 'CeliteCreators', a pay-per-product digital asset marketplace in India for video editors, 3D artists, and sound engineers. 

Aesthetic & Theme:
- Crisp White Light Theme (#FFFFFF background, #F8FAFC soft slate panels) with subtle borders (#E2E8F0) and glowing Sky Blue accents (#0284C7).
- High-contrast typography using Geist for headings (#0F172A) and Inter for body text (#475569).

Layout Structure:
1. Top Sticky Navigation (Glassmorphic White Header):
   - Left: Brand logo 'CeliteCreators' with a glowing Sky Blue 'C' icon and 'Pay-Per-Product' badge.
   - Center: Nav links for 'Browse Catalog', 'Become a Creator', 'Admin'.
   - Right: '+ Upload Asset' button in solid Sky Blue and 'Creator Dashboard' button.
2. Hero Section:
   - Pill badge: 'Single-Product Purchases • No Subscriptions Needed'.
   - Headline: 'Pay-Per-Product Creator Asset Marketplace'.
   - Subheading: 'Buy premium After Effects templates, 3D Blender models, cinematic SFX packs, and Figma UI kits in INR (₹) without monthly subscription traps.'
   - White glassmorphic search bar with search icon, auto-suggestions, and quick filter pills ('After Effects', 'Blender 3D', 'Cinematic SFX', 'Figma Kits').
3. Featured Categories Grid:
   - 4 white glassmorphic cards with subtle shadow hover effects:
     - Video Templates (After Effects & Premiere Pro MOGRTs)
     - 3D Models & Assets (Blender & Cinema 4D)
     - Audio & Cinematic SFX (Royalty-free tracks & sound packs)
     - Graphics & UI Kits (Figma mobile & web app kits)
4. Trending Products Grid:
   - 3-column card layout displaying 4K video preview thumbnails with play hover overlay, software badges (e.g. After Effects CC), rating stars (4.9), sales count (320 buyers), and prominent INR price tags (e.g. ₹399, ₹699).
5. Footer:
   - Includes Razorpay INR payment security seals, Cloudflare R2 presigned storage status, and platform links.
```

---

## 2. Browse & Search Catalog Page (`/browse`) Prompt

```text
Design an information-dense, filterable catalog search page for 'CeliteCreators Marketplace' in Crisp White Light Theme.

Aesthetic & Theme:
- Pure White background (#FFFFFF) with soft slate filter sidebars (#F8FAFC) and dark slate typography (#0F172A).

Layout Structure:
1. Header Section:
   - Headline: 'Browse Creator Market Catalog'.
   - Subtitle: 'Filter by software compatibility, resolution, rating, and price in INR (₹).'
   - Centered search input bar with instant auto-filtering.
2. Main Content Grid (1-to-3 Column Split):
   - Left Sidebar Filters (White Glassmorphic Panel):
     - Asset Category Selector (All, Video Templates, 3D Models, Audio SFX, Graphics).
     - Software Compatibility Checkboxes (After Effects CC, Premiere Pro, Blender 3D, Figma, DaVinci Resolve).
     - Price Range Slider (₹0 to ₹2,000 INR).
     - Customer Rating Filter (4+ Stars).
   - Right Product Grid:
     - 3-column grid of asset cards.
     - Each card features a high-res thumbnail image, software pill badge, title, star rating, sales count, price in INR, and a 'View Asset Details' primary action button.
```

---

## 3. Product Detail Page (`/product/[slug]`) & Buy Drawer Prompt

```text
Design a product detail page for a 4K After Effects video template titled 'Cyberpunk HUD Video Opener 4K' on CeliteCreators Marketplace in Crisp White Light Theme.

Layout Structure:
1. Product Header:
   - Category pill: 'Video Template'.
   - Rating: '4.9 Stars (320 purchases)'.
   - Title: 'Cyberpunk HUD Video Opener 4K'.
   - Subtitle: 'High-impact 4K video opener with modular HUD elements and custom sound effects.'
2. Left Column (2-Column Desktop Grid):
   - Interactive Preview Player: 16:9 video preview player with play/pause controls, mute toggle, and audio visualizer.
   - Specifications Table (White Card Panel):
     - Compatible Software: After Effects CC 2024, Premiere Pro MOGRT
     - Plugins Required: No Plugins Required
     - Resolution: 4K Ultra HD (3840x2160)
     - File Package: 1.2 GB (.zip source package)
     - License: Commercial Use License
3. Right Column (Sticky 1-Click Buy Action Card):
   - Price Display: '₹399 INR' with 'Single Purchase' badge.
   - Verified Creator Snippet: 'Apex Motion Studio' with verified pro checkmark.
   - Primary Action Button: 'Buy Now with Razorpay' in vibrant Sky Blue with ⚡ icon.
   - Presigned R2 Link Countdown Box: Demonstrates an active 15-minute countdown clock ('15:00' -> '14:59') for the presigned Cloudflare R2 download link post-payment verification.
```
