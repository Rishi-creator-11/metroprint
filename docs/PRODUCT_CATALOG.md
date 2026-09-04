# Product Catalog Map

_Verified against live Supabase (`tggerxbkxtnucmlrafqn`), 2026-08-29._

- **50 rows** in `products`; **33 active** (`active = true`).
  _(2026-08-29: DTF Printing removed from the storefront — its 2 rows deactivated,
  category deleted from code. Was 35 active / 6 categories.)_
- The **33 active rows are the live storefront catalog** (5 categories: Business
  Cards, Print Materials, Apparel, Marketing Services, Promotional Products).
- **17 inactive rows** — 15 legacy product generations + the 2 DTF products
  deactivated 2026-08-29. Kept in the DB, never routed to, never shown.

## Legend

| Column | Meaning |
|---|---|
| **Fallback def** | file/line where the seed (code) definition lives, if any |
| **Options source** | where the *option set* actually comes from at runtime |
| **Pricing** | how the line price is produced (see `PRICING_ARCHITECTURE.md`) |

- **Options source = "seed"** → `products-data.ts` overrides the DB
  `options_schema` (`enrichProductFromSeed`, because the slug is in
  `admin-pricing-catalog.ts`). Editing options = edit code.
- **Options source = "DB"** → the DB `options_schema` is used as‑is; seed is only
  a fallback if Supabase is down.
- **Pricing "tier (DB)"** → `pricing_rules.option_prices.quantity` exists in the
  DB. **"tier (synth)"** → option‑priced but quantity prices are synthesized from
  `price` × `TIER_SCALE`. **"flat × qty"** → `price × quantity`, no option pricing.

All configurable products additionally carry a non‑priced `need_design_help`
(Yes/No) field.

---

## Category: Business Cards  (10 active / 24 rows)

Storefront hierarchy: `/business-cards` → 3 groups → product → PDP
(`/business-cards/[group]/[slug]`). Also reachable via `/products?category=Business%20Cards`.
Group routing is by **slug prefix**, not the DB `subcategory` column
(`src/app/products/page.tsx` `BUSINESS_CARD_LINES`, `src/app/business-cards/[group]/page.tsx`).

| Product | Slug | Group (prefix) | DB subcat | Options source | Pricing | Fallback def |
|---|---|---|---|---|---|---|
| Standard Business Cards | `business-cards-standard` | standard | Standard | seed | tier (DB) | products-data.ts:325 |
| Metallic Foil Business Cards | `business-cards-premium-metallic-foil-raised` | premium | Premium | seed | tier (DB) | products-data.ts:337 |
| Kraft Paper Business Cards | `business-cards-premium-kraft-paper` | premium | Premium | seed | tier (DB) | products-data.ts:358 |
| Durable Business Cards | `business-cards-premium-durable` | premium | Premium | seed | tier (DB) | products-data.ts:364 |
| Spot UV Business Cards | `business-cards-premium-spot-uv-raised` | premium | Premium | seed | tier (DB) | products-data.ts:370 |
| Soft Touch Business Cards | `business-cards-premium-soft-touch-suede` | premium | Premium | seed | tier (DB) | products-data.ts:386 |
| 32pt Painted Edge Business Cards | `business-cards-premium-32pt-painted-edge` | premium | Premium | seed | tier (DB) | products-data.ts:393 |
| Fold-over Business Cards | `business-cards-specialty-fold-over` | specialty→"Custom" | Custom | seed | tier (DB) | products-data.ts:438 |
| Plastic Business Cards | `business-cards-specialty-plastic` | specialty→"Custom" | Custom | seed | tier (DB) | products-data.ts:477 |
| Magnetic Business Cards | `business-cards-specialty-magnetic` | specialty→"Custom" | Custom | seed | tier (DB) | products-data.ts:530 |

Shared option building blocks (`products-data.ts`):
- Quantity tiers: `250, 500, 1,000, 2,500, 5,000, 10,000, Custom order`
  (`BUSINESS_CARD_QUANTITY_OPTIONS`). "Custom order" → quote flow, price = 0.
- `standardBusinessCardOptions`: quantity, stock (14/16/18pt), finish (Matte / UV
  Gloss), corners (Rectangle / Rounded), sides (Single / Double).
- `premiumBaseOptions(extra)`: quantity, size (`3.5" x 2"`), …extra…, corners,
  sides.
- Product‑specific fields: `foil_color` + `lamination` (metallic foil);
  `lamination` + `spot_uv` (spot UV); `paint_color` (17 edge colours, 32pt);
  `finish` incl. Soft Touch + sizes `2"x7"` / `3.5"x4"` (fold‑over); `shape`,
  `plastic_type`, `colorspec` (plastic); `shape`, `corner_radius` (magnetic).

> **Note:** migration `20260821030637` stripped `stock`/`finish` from the DB
> `options_schema` of Business Cards, but the seed schema (which wins for these
> slugs) still defines them for Standard / fold‑over. The storefront shows the
> seed version.

---

## Category: Print Materials  (9 active / 10 rows)

Reachable via `/products?category=Print%20Materials` and PDP `/products/[slug]`.
All use `BUSINESS_CARD_QUANTITY_OPTIONS` for quantity (except where noted) and all
are option‑priced (`admin-pricing-catalog.ts` "print-materials" section).

| Product | Slug | Options source | Pricing | Option builder | Notable options |
|---|---|---|---|---|---|
| Flyers | `flyers` | seed | **tier (synth)** — no DB quantity tiers | `options/flyer-options.ts` | 33 sizes, paper (100lb Gloss/Matte, 80lb Text), sides |
| Postcards | `postcards` | seed | tier (DB) | `options/postcard-options.ts` | 10 sizes, stock (14pt/16pt C2S), sides |
| Brochures | `brochures` | seed | tier (DB) | `options/brochure-options.ts` | 6 sizes, fold_type (Half/Z/4‑Panel), sides |
| Bookmarks | `bookmarks` | seed | tier (DB) | `options/bookmark-options.ts` | 9 sizes, stock (from postcard), sides |
| Door Hangers | `door-hangers` | seed | tier (DB) | `options/door-hanger-options.ts` | 2 sizes, stock, sides |
| Folders | `folders` | seed | tier (DB) | `options/folder-options.ts` | 6 sizes, pockets Yes/No, business_card_slit (None/Right/Left/Both) |
| Posters | `posters` | seed | tier (DB) | `options/poster-options.ts` | sizes `18x24 / 24x36 / 11x17`, paper_type (Glossy/Matte/Satin) |
| Roll-Up Banners | `roll-up-banners` | seed | tier (DB) | `options/roll-up-banner-options.ts` | size `33"x81"`, metal_stand (Standard/Premium) |
| Car Door Magnets | `car-door-magnets` | seed | tier (DB) | `options/car-door-magnet-options.ts` | 6 sizes, rounded_corners Yes/No |

Legacy inactive: `business-cards` (old generic "Business Cards" product, category
Print Materials) — replaced by the Business Cards category.

---

## Category: Apparel  (6 active)

`/products?category=Apparel`, PDP `/products/[slug]`.

| Product | Slug | Options source | Pricing | Option builder |
|---|---|---|---|---|
| Custom T-Shirt Printing | `custom-t-shirt-printing` | seed | tier (DB) | `apparelPrintingOptionsSchema({shirt_color, includeMaterial:true})` |
| Custom Long-Sleeve T-Shirt Printing | `custom-long-sleeve-t-shirt-printing` | seed | tier (DB) | same, `shirt_color`, material |
| Custom Polo Printing | `custom-polo-printing` | seed | tier (DB) | `polo_color`, no material |
| Custom Hoodie Printing | `custom-hoodie-printing` | seed | tier (DB) | `hoodie_color`, no material |
| Custom Hats | `custom-hats` | seed | tier (DB) | inline schema: quantity, hat_style (Trucker/Baseball Cap), hat_color |
| Tote Bags | `tote-bags` | **DB** (not in admin pricing catalog) | **flat × qty** | inline: quantity `25/50/100/250/500`, bag_color (text), print_sides |

Apparel quantity options: `1, 6, 12, 48, 96` (`APPAREL_QUANTITY_OPTIONS`).
Colours: 18‑value `BASIC_APPAREL_COLORS` list, rendered as swatches
(`ProductAddToCart` `COLOR_SWATCHES`). Print locations: Front / Back / Front and
Back. Optional `size_breakdown` textarea.

> `custom-hats` live `price = 1.00` / `base_price_text = "Starting at $1.00"` —
> looks like a test value entered via `/admin/prices`. Confirm with owner.

---

## Category: DTF Printing — REMOVED 2026-08-29

The **DTF Printing** category and its two products were removed from the
storefront on 2026-08-29 (business decision — no longer offered).

- Code: category dropped from `ProductCategory` (`types.ts`), `CATEGORIES`
  (`constants.ts`), `SEED_PRODUCTS` + `POPULAR_PRODUCT_SLUGS`
  (`products-data.ts`), `PRODUCT_PRICES` (`product-prices.ts`), and homepage
  hero copy (`page.tsx`).
- Supabase: rows `dtf-transfers` and `custom-apparel-printing-dtf` set to
  `active = false` — **not deleted**, so any historical order referencing them
  is unaffected.

| Product | Slug | State |
|---|---|---|
| DTF Transfers | `dtf-transfers` | inactive (deactivated 2026-08-29) |
| Custom Apparel Printing (DTF) | `custom-apparel-printing-dtf` | inactive (deactivated 2026-08-29) |

---

## Category: Promotional Products  (3 active)

| Product | Slug | Options source | Pricing | Options |
|---|---|---|---|---|
| Custom Mugs | `custom-mugs` | DB | flat × qty | quantity `12/24/48/72/144` |
| Custom Tumblers | `custom-tumblers` | DB | flat × qty | quantity `12/24/48/72/144` |
| Branded Merchandise | `branded-merchandise` | DB | flat × qty (`base_price_text = "Custom pricing"`) | est. quantity, item_types (textarea), budget (text) |

---

## Category: Marketing Services  (5 active)

All **DB options**, **flat pricing** (service pricing — `price` is a nominal
figure; these are effectively quote‑style even though checkout would accept them).

| Product | Slug | `price` | Options |
|---|---|---|---|
| Graphic Design Services | `graphic-design-services` | 75.00 | project_type, deadline |
| Branding | `branding` | 499.00 | package_level (Starter/Professional/Enterprise), deliverables |
| Social Media Management | `social-media-management` | 299.00 | platforms, posting_frequency |
| Video Production | `video-production` | 999.00 | video_type, duration |
| Content Creation | `content-creation` | 50.00 | content_type, quantity `1/5/10/Ongoing` |

---

## Legacy / Inactive DB products  (17 rows — DO NOT delete, DO NOT route to)

_Plus `dtf-transfers` and `custom-apparel-printing-dtf`, deactivated 2026-08-29
(see the removed DTF Printing section above)._


| Slug | Title | Category / subcat |
|---|---|---|
| `business-cards` | Business Cards | Print Materials (old generic) |
| `bc-standard-matte` | Matte Business Cards | Business Cards / Standard |
| `bc-standard-uv-gloss` | UV Gloss Business Cards | Business Cards / Standard |
| `bc-premium-metallic-foil-raised` | Metallic Foil (Raised) Business Cards | Business Cards / Premium |
| `bc-premium-kraft-paper` | Kraft Paper Business Cards | Business Cards / Premium |
| `bc-premium-durable` | Durable Business Cards | Business Cards / Premium |
| `bc-premium-spot-uv-raised` | Spot UV (Raised) Business Cards | Business Cards / Premium |
| `bc-premium-pearl-paper` | Pearl Paper Business Cards | Business Cards / Premium |
| `bc-premium-die-cut` | Die Cut Business Cards | Business Cards / Premium |
| `bc-premium-soft-touch-suede` | Soft Touch (Suede) Business Cards | Business Cards / Premium |
| `bc-premium-32pt-painted-edge` | 32pt Painted Edge Business Cards | Business Cards / Premium |
| `bc-premium-ultra-smooth` | Ultra Smooth Business Cards | Business Cards / Premium |
| `bc-specialty-fold-over` | Fold Over Business Cards | Business Cards / Specialty |
| `bc-specialty-plastic` | Plastic Business Cards | Business Cards / Specialty |
| `bc-specialty-magnetic` | Magnetic Business Cards | Business Cards / Specialty |

These are the **first‑generation** business‑card catalog (`bc-*` slugs,
`subcategory = "Specialty"`). The current catalog uses `business-cards-*` slugs
and `subcategory = "Custom"`. Two products (`bc-premium-pearl-paper`,
`bc-premium-die-cut`, `bc-premium-ultra-smooth`) have **no current equivalent** —
if the shop wants them back, re‑create as `business-cards-*` rows + seed defs, do
not simply flip `active`.

---

## Duplication / fragmentation notes

1. **Business‑card slugs exist in two generations** (`bc-*` inactive,
   `business-cards-*` active). Resolved by `active` — no code references `bc-*`.
2. **`options_schema` is defined twice** for every option‑priced product: once in
   the DB row, once in `products-data.ts`. The seed wins at runtime. `seed.sql`
   contains a **third, older** copy (e.g. brochures with `8.5x11 Tri-Fold` sizes,
   door‑hangers with only quantity) — `seed.sql` is not run automatically and is
   stale; treat it as historical.
3. **`PRODUCT_PRICES`** (`product-prices.ts`) lists a `price` for all 33 slugs +
   `tote-bags` + old `business-cards` — a fourth copy of base prices, used only as
   fallback when the DB `price` is null/0.
4. `POPULAR_PRODUCT_SLUGS` (home page) references 6 slugs incl.
   `graphic-design-services` and `roll-up-banners`.
