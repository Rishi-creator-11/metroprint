# Pricing Architecture

_Verified against live Supabase, 2026-08-29._

> **AUTHORITATIVE FOR CHECKOUT = server-side recalculation in `/api/checkout`
> using current Supabase product data.** Everything the browser sends
> (`unit_price`, `line_total`, `quantity`) is recomputed and discarded server-side.
> Do not change this.

---

## 1. Where prices come from (all sources)

| # | Source | Location | Kind | Role |
|---|---|---|---|---|
| 1 | `products.pricing_rules` (jsonb) | live DB, edited via `/admin/prices` | per-option price map | **Primary.** 23 of 33 active products have it. |
| 2 | `products.price` (numeric) | live DB, edited via `/admin/prices` | single base price | Base for non-option products; base for synthesizing tiers. |
| 3 | `products.base_price_text` (text) | live DB, auto-written on save | display string only | "Starting at $X" shown on PDP/cards. **Never** used in math. |
| 4 | `PRODUCT_PRICES` map | `src/lib/products/product-prices.ts` | hardcoded `{slug: number}` | Fallback base price when DB `price` is null/≤0. |
| 5 | Synthesized quantity tiers | `src/lib/pricing/business-card-pricing-defaults.ts` (`TIER_SCALE`) | computed | For option-priced products with no saved quantity tiers. |
| 6 | Constant `29.99` | `getProductPrice()` final fallback | hardcoded | Last resort if slug unknown everywhere. |

There is **no** third-party pricing API, no formula engine beyond `TIER_SCALE`,
and no per-product bespoke pricing code — all products go through the one
`calculateLinePrice()` function.

### `pricing_rules` shape

```jsonc
{
  "option_prices": {
    "quantity": { "250": 25.49, "500": 29.99, "1,000": 40.49, ... },  // TOTAL order price
    "sides":    { "Single Sided": 0, "Double Sided": 5 },              // ADD-ON when selected
    "stock":    { "14pt": 0, "16pt": 5, "18pt": 10 },
    "finish":   { "Matte": 0, "UV Gloss": 8 },
    "corners":  { "Rectangle": 0, "Rounded": 3 }
  }
}
```

`normalizePricingRules()` (`pricing.ts`) also accepts two **legacy shapes** and
folds them into `option_prices`:
- `quantity_tiers: {"500": 49.99}` → `option_prices.quantity`
- `option_addons: {"finish": {"UV Gloss": 8}}` → `option_prices.<field>`

---

## 2. Which products use which model

| Model | Products | How the line total is computed |
|---|---|---|
| **Option pricing, DB tiers** | 23 active: all business cards, all print materials **except flyers**, all apparel except tote-bags | `option_prices.quantity[selectedQty]` + Σ add-ons for other selected options |
| **Option pricing, synthesized tiers** | `flyers` (option-priced but no `quantity` key saved) | `price` × `TIER_SCALE[qty] / TIER_SCALE[anchor]`, rounded; + Σ add-ons (all default 0) |
| **Flat × quantity** | `tote-bags`, all promotional, all marketing services | `getCartLineTotal(price, qty)` = `round(price × qty)` |
| **Quote required** | any product where quantity = `"Custom order"` | line total forced to `0`, `requiresQuote = true`, checkout blocked |

"Option-priced" = `isOptionPricingSlug(slug)` true, i.e. the slug matches a
section in `src/lib/pricing/admin-pricing-catalog.ts` **and** its schema has a
`quantity` field (`usesOptionPricing()` in `business-card-pricing-defaults.ts`).

`TIER_SCALE` (anchor = 500): `250→0.85, 500→1, 1,000→1.35, 2,500→2, 5,000→2.8,
10,000→4, "Custom order"→0`.

---

## 3. The calculation function

`calculateLinePrice(basePrice, pricingRules, selectedOptions, context)` →
`{ lineTotal, unitPrice, orderQuantity, isTierPricing, requiresQuote }`
(`src/lib/pricing/pricing.ts`).

```
1. usesTierPricing = usesOptionPricing(slug, category, optionsSchema)
2. orderQuantity   = parseQuantityFromOptions(selectedOptions)   // digits only, min 1
3. if quantity selection == "Custom order"  → return {0,0,0, isTierPricing:true, requiresQuote:true}
4. optionPrices = pricingRules.option_prices ?? {}
   if usesTierPricing && optionsSchema:
       optionPrices = resolveOptionPrices(basePrice, optionsSchema, pricingRules)
           // merges saved rules + synthesized defaults for every priced field/value
5. pick lineTotal:
     a. saved quantity price exists         → optionPrices.quantity[qty]           (isTierPricing)
     b. else usesTierPricing                → getStartingPrice(basePrice, ...)  = lowest qty price (isTierPricing)
     c. else quantity field priced but no value → basePrice                       (isTierPricing)
     d. else                                → getCartLineTotal(basePrice, orderQuantity)   (flat)
6. for every OTHER selected option with a value:
     extra = optionPrices[field][value];  if extra > 0 → lineTotal += extra
7. lineTotal = round(lineTotal * 100) / 100
8. unitPrice = isTierPricing ? lineTotal : basePrice
```

`basePrice` passed in = `getProductPrice(slug, dbPrice)` =
`dbPrice > 0 ? dbPrice : PRODUCT_PRICES[slug] ?? 29.99`.

### Display-only helpers (never used for checkout)

- `getProductDisplayPrice(slug, dbPrice, rules, ctx)` → the "From $X" figure on
  cards / PDP. For option-priced products = lowest synthesized/saved quantity
  price; else = `getStartingPrice`.
- `getStartingPrice(base, rules)` → lowest positive `option_prices.quantity`
  value, else `base`.
- `formatPrice()` = `Intl.NumberFormat` USD. `formatPriceLabel()` = `"Starting at $X"`.

---

## 4. End-to-end price flow, per representative product

### Standard Business Cards (`business-cards-standard`) — DB tier

```
user picks quantity=500, stock=16pt, finish="UV Gloss", corners=Rounded, sides="Double Sided"
 → base = 29.99 (DB price)
 → resolveOptionPrices merges DB pricing_rules:
      quantity.500 = 29.99 (example live value)
      stock."16pt" = 5, finish."UV Gloss" = 8, corners.Rounded = 3, sides."Double Sided" = 5
 → lineTotal = 29.99 + 5 + 8 + 3 + 5 = 50.99
 → unitPrice = 50.99, orderQuantity = 500, isTierPricing = true
CLIENT shows $50.99.  /api/checkout recomputes identically from Supabase → Stripe line item = 5099 cents.
```

### Flyers (`flyers`) — synthesized tier

```
user picks quantity=1,000, size, paper_type, sides
 → base = 49.99 (DB price)
 → no pricing_rules.quantity  → defaultQuantityPrices(49.99, schema):
      500 anchor → 1,000 = round(49.99 * 1.35 / 1) = 67.49
 → non-quantity options default to +0
 → lineTotal = 67.49
```

### Custom Mugs (`custom-mugs`) — flat × qty

```
user picks quantity=24
 → not option-priced → getCartLineTotal(11.99, 24) = 287.76
 → unitPrice = 11.99, isTierPricing = false
```

### Any product, quantity = "Custom order"

```
 → requiresQuote = true, lineTotal = 0
 → PDP swaps "Add to Cart" for "Request Quote"
 → /api/checkout rejects the whole cart with a 400 if such a line is present
```

---

## 5. Admin editing path (`/admin/prices`)

1. `loadAdminPricingSections()` (`src/lib/pricing/admin-pricing-server.ts`) reads
   DB rows for the 3 configured sections, merges seed fallbacks for expected
   slugs, and for option-priced slugs substitutes the **seed** `options_schema`
   so the editor shows the correct field/value list.
2. `AdminPricingHub` builds a draft from `buildPricingDraft()` =
   `resolveOptionPrices(price, schema, rules)` — i.e. saved values or synthesized
   defaults, one input per option value.
3. Save → `PATCH /api/admin/products/:id` (or `/by-slug/:slug` for a
   seed-only product not yet in the DB — it gets **inserted**). Body:
   `{ price: <lowest positive quantity price or current price>, pricing_rules }`.
4. The route validates (`price > 0`), `normalizePricingRules()`, writes
   `price` + `pricing_rules` + recomputed `base_price_text`
   (`formatPriceLabel(getStartingPrice(...))`).

`pricing_rules` from the draft keeps **every** field/value (including `+0`
add-ons), so a saved product's storefront pricing is fully explicit.

---

## 6. Duplicate / competing systems — which one wins

| Pair | Winner | Notes |
|---|---|---|
| DB `pricing_rules` vs synthesized `TIER_SCALE` | **DB**, per field/value; synthesis only fills gaps | `resolveOptionPrices` merges; saved value always overrides default |
| DB `price` vs `PRODUCT_PRICES[slug]` | **DB** when `> 0`, else the map | `getProductPrice()` |
| DB `options_schema` vs seed `options_schema` | **seed** for option-priced slugs; **DB** otherwise | `enrichProductFromSeed` |
| DB `base_price_text` vs computed | always overwritten on admin save | display only |
| `seed.sql` price data | **stale / unused** — file is not auto-run | ignore for pricing |
| Client `calculateLinePrice` vs server `calculateLinePrice` | **same function**, server result is authoritative for the order + Stripe | client is preview only |

**Do not consolidate these yet.** The DB is authoritative; the code fallbacks are
resilience. Before changing any resolution rule, capture input→output fixtures
for at least: one DB-tier BC, flyers (synth), one flat product, one "Custom
order" case, and one multi-add-on selection — and assert the refactor reproduces
them exactly.

---

## 7. Regression tests (Phase 3)

`calculateLinePrice()` is frozen by **62 regression tests** in
`src/lib/pricing/tests/pricing.test.ts`, driven by a verbatim Supabase snapshot
(`price` + `pricing_rules`) in `src/lib/pricing/tests/fixtures.ts` captured
**2026-09-03** (migration `035_large_format_products.sql` not applied at capture).

Run: `npm run test:pricing` (or `npm test`). The helper `calcLine(slug, options)`
mirrors the per-line math in `POST /api/checkout` exactly
(`getProductPrice` → `normalizePricingRules` → seed `options_schema` →
`calculateLinePrice`).

Covered: Standard / Premium (Metallic Foil, Spot UV, 32pt Painted Edge) /
Specialty (Plastic, Magnetic, Fold-over) business cards; Postcards, Brochures,
Bookmarks, Door Hangers, Folders, Posters, Roll-Up Banners, Car Door Magnets,
Flyers; T-Shirt, Hoodie, Hats; one flat product (Custom Mugs); the base-price
ladder; `pricing_rules` precedence + gap-filling; `normalizePricingRules` legacy
shapes; and the "Custom order" quote contract.

**When a price legitimately changes in Supabase:** update the affected slug in
`fixtures.ts` **and** the affected expected totals in `pricing.test.ts` in the
same commit. Never edit a fixture value just to make a failing test green — a
failure there means a line total moved.

---

## Known Pricing Behaviors / Review Items

Surfaced while writing the Phase 3 tests. **None of these were changed** — the
tests freeze the current behavior as-is. Decide deliberately later.

| # | Behavior | Where | Why it's worth a look |
|---|---|---|---|
| RP-1 | **Custom Hats base price is `$1.00`** and every quantity tier equals the raw unit count (`1 / 6 / 12 / 48 / 96`). | live `products.pricing_rules` for `custom-hats` | Almost certainly a placeholder/test value. A 12-hat order currently totals **$12.00**. Confirm the real price with the owner, then re-save in `/admin/prices`. |
| RP-2 | **`PRODUCT_PRICES` fallback map disagrees with the live DB `price`** for `custom-hats` (map `14.99`, DB `1.00`) and is generally a stale mirror. | `src/lib/products/product-prices.ts` | Only bites when the DB `price` is null/0, but it means "the fallback" and "the real price" are two different numbers. Reconcile or drop the map (tracked in `CODEBASE_AUDIT.md`). |
| RP-3 | **Posters: the 250 tier (`$15`) is *below* the base price (`$19.99`)** and is the cheapest absolute price for the product. | live `pricing_rules` for `posters` | Ordering 250 posters costs `$15` total. May be intentional bulk pricing, but the smallest tier being the global minimum is unusual — verify. |
| RP-4 | **Roll-Up Banners schema / DB drift.** The seed `options_schema` now uses a `banner_type` field (6 options, from the in-progress Large Format rework) but the live `pricing_rules` still carry the old `metal_stand` map (migration `035` not applied). Result: every `banner_type` selection currently adds **`$0`**, and the `metal_stand` prices in the DB are dead (no schema field references them). | `roll-up-banner-options.ts` vs live DB; `supabase/migrations/035_large_format_products.sql` | Resolves when `035` is applied. Until then the storefront shows a `banner_type` picker that has no price effect. Re-capture the `roll-up-banners` fixture + expected totals after `035` lands. |
| RP-5 | **Flyers pricing is 100% synthesized** — `pricing_rules` is literally `{}` in the DB, so all six flyer tiers come from `price × TIER_SCALE` (`42.49 / 49.99 / 67.49 / 99.98 / 139.97 / 199.96`). The 500 tier equals the base price by construction (anchor = 500). | live DB; `business-card-pricing-defaults.ts` `TIER_SCALE` | Known and intended, now frozen by tests. If real flyer print costs differ from the `TIER_SCALE` curve, enter them in `/admin/prices` — no code change needed. |
| RP-6 | **Add-on prices only apply when `> 0`.** `calculateLinePrice` does `if (extra != null && Number(extra) > 0) lineTotal += extra`. A negative value in `pricing_rules` (a discount) would be **silently ignored**, not subtracted. | `pricing.ts` line ~118 | No product uses negative add-ons today. If "discount" options are ever wanted, the engine needs a change. |
| RP-7 | **`parseQuantityFromOptions` strips all non-digits** (`"1,000" → 1000`). Correct for every current product, but any future field literally named `quantity` holding non-numeric text would collapse to `1`. | `product-prices.ts` | Fragile coupling between the field name `quantity` and "this is a parseable integer". |
| RP-8 | **`car-door-magnets` has a real non-zero size add-on** (`12" x 24"` = `+$20`) while every other current print/BC product's non-quantity options are `0` or small. | live `pricing_rules` for `car-door-magnets` | Not a bug — just the one product where a non-`sides`/`stock` field materially moves the price. Noted so a refactor doesn't assume "size is always free". |

### 2026-09-03 update

- **Fixed (real bug):** `/api/checkout` did not fall back to the seed definition
  for products absent from the DB, so a Large Format / seed-only line was priced
  `price × quantity` (500 yard signs → **$9,995** instead of a ~$20 tier). It now
  resolves `options_schema` from the seed for any slug missing a DB row, matching
  `getProductBySlug`. Covered by a smoke check; all 62 pricing tests still green.
- **Fixed (drift):** `enrichProductFromSeed` now also takes `category` from the
  seed, so `roll-up-banners` / `car-door-magnets` sit under **Large Format** on
  the storefront even though the live DB rows still say "Print Materials"
  (migration 035 not applied — do not apply blindly).
- **Deferred — intended price genuinely unknown, left as-is + flagged:**
  Custom Hats `$1` (RP-1), Posters 250-tier `$15` (RP-3), Flyers synthesized
  tiers (RP-5), `PRODUCT_PRICES` vs DB disagreements e.g. plastic `$34.99`/`$19.57`
  (RP-2). No values were invented. Large Format storefront + checkout prices are
  currently synthesized from `PRODUCT_PRICES` × `TIER_SCALE`; migrations 035/036
  hold the "intended" Sinalite-style curves and can be applied later.
