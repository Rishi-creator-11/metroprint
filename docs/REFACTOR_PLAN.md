# Refactor Plan

_2026-08-29. Scope: make the codebase easier to build on **without a rewrite**
and without changing any customer-facing behavior, product, price, or DB schema._

This is a **living plan**, not a mandate to execute everything now. Stages 0–2
are done. The rest are proposed, ordered by safety.

---

## 1. Current architecture (as-found)

```
Next.js 15 App Router (RSC + client) ──► src/lib/products/products.ts ──► Supabase `products` (+ seed fallback)
                                    └──► src/lib/pricing/pricing.ts ─────► calculateLinePrice (client preview)
localStorage cart (CartProvider) ──► /api/checkout ──► calculateLinePrice (server, authoritative)
                                                  └──► INSERT quote_requests ──► Stripe Checkout
Stripe webhook + /checkout/complete ──► fulfillPaidCheckoutSession ──► quote_requests paid + Resend emails
/admin/* ──(middleware + requireAdminUser/Api)──► dashboard (quote_requests) + prices (products.pricing_rules)
```

- Data + fallback + option schemas + pricing rules all interleave in
  `src/lib/*`.
- Two product layers (DB + `SEED_PRODUCTS`), reconciled by `enrichProductFromSeed`.
- One `quote_requests` table doing orders + inquiries + dead legacy columns.
- Pricing spread over `pricing.ts` + `business-card-pricing-defaults.ts` +
  `product-prices.ts` + DB `pricing_rules`.

## 2. Problems (see `CODEBASE_AUDIT.md` for full list + severity)

| Ref | Problem |
|---|---|
| CRIT-1 | `quote_requests` RLS wide open (migration 004 not applied) |
| CRIT-2 | Migrations folder ≠ live DB |
| HIGH-1 | `options_schema` in 3 places, seed silently wins |
| HIGH-2 | Pricing logic split 3 files + DB, implicit precedence, near-cycle |
| HIGH-3 | `quote_requests` overloaded |
| HIGH-4 | middleware double auth round-trip |
| MED-2 | flat `src/lib` (fixed) |
| MED-3 | BC grouping logic duplicated 3–4×|
| MED-1 | admin auth duplicated 4× (fixed) |

## 3. Proposed target architecture

Keep it modest. Target `src/lib` layout (Stage 0–2 already there):

```
src/lib/
  products/
    products.ts            # read layer: getProducts / getProductBySlug / by category
    products-data.ts       # SEED_PRODUCTS (fallback + option-schema source)
    product-prices.ts      # PRODUCT_PRICES fallback map + getProductPrice
    options/               # per-product OptionsSchema builders
  pricing/
    pricing.ts             # calculateLinePrice + normalizePricingRules + getStartingPrice
    business-card-pricing-defaults.ts   # TIER_SCALE + resolveOptionPrices  (rename later: tier-defaults.ts)
    business-card-quantities.ts          # shared quantity tiers
    admin-pricing-catalog.ts             # which slugs are option-priced / editable
    admin-pricing-server.ts              # admin screen data loader
  checkout/
    stripe.ts stripe-checkout.ts stripe-metadata.ts
    fulfill-order.ts order-utils.ts artwork.ts quote-normalize.ts
  admin/admin-server.ts    # requireAdminUser + requireAdminApi (shared resolveAdmin)
  supabase/                # unchanged
  auth.ts constants.ts email.ts types.ts utils.ts   # leaf/shared, stay at root
```

Clear separation achieved:
- **UI** — `src/app`, `src/components` (no price math, no direct Supabase in
  components except the browser auth client).
- **Product config** — `lib/products/`.
- **Pricing** — `lib/pricing/`.
- **DB access** — `lib/supabase/` + the read/write functions in
  `lib/products/products.ts` and the API routes.
- **Checkout/orders** — `lib/checkout/`.
- **Admin** — `lib/admin/` + `lib/pricing/admin-*`.
- **Types** — `lib/types.ts`.

Deliberately **not** doing: a generic `Repository<T>` layer, a `ProductVariant`
/ `PricingMatrix` class hierarchy, a DI container, or a rules engine. Printing
products are irregular; product-specific option builders (the current
`options/*.ts` pattern) are the right amount of structure — **extend that
pattern**, don't replace it.

## 4. Migration sequence

| Stage | What | Risk | Status |
|---|---|---|---|
| **0** | Documentation + audit (this `docs/` set) | none | ✅ done 2026-08-29 |
| **1** | `src/lib` folder grouping — `git mv` + import updates only | low (tsc/eslint/build gate) | ✅ done 2026-08-29 |
| **2** | Centralize admin API auth into `requireAdminApi()` | low | ✅ done 2026-08-29 |
| **3** | **Regression fixtures** for pricing (see §7) before any pricing edit | none (adds tests) | proposed |
| 4 | Type cleanup: `productRow` type in `admin-pricing-server.ts`; drop `@deprecated` `QuoteRequest`/`normalizeQuoteRequest` if unused; tighten `normalizeOrder` | low | proposed |
| 5 | One `BUSINESS_CARD_GROUPS` config, consumed by `/products`, `/business-cards/*`, `products.ts` (MED-3) | low-med (visual regression check on 3 pages) | proposed |
| 6 | Pricing consolidation: explicit `resolvePricing()` + pure `priceLine()`; break the `product-prices ↔ pricing` cycle. **Gated by Stage 3 fixtures.** (HIGH-2) | med | proposed |
| 7 | `enrichProductFromSeed` → only override `options_schema`, keep DB title/desc after verifying DB rows are sane (MED-4, HIGH-1) | med | proposed |
| 8 | middleware: reuse `updateSession` user, drop the 2nd client (HIGH-4) | med | proposed |
| 9 | `supabase/migrations/README.md` freeze note + optional generated `schema-baseline.sql` (not applied) (CRIT-2) | none | proposed |
| 10 | **RLS fix migration** for `quote_requests` (CRIT-1) — standalone, reviewed, tested | high (prod DB) | proposed, **owner sign-off required** |
| 11 | Remove proven dead code: `getSeedProductsByCategory`, `usesBusinessCardPricing`, `netlify.toml` or `.vercel` (pick one), move `seed.sql` to `legacy/` | low | proposed |
| 12 | (Feature, not refactor) Full product CRUD admin — new `/admin/products` screens + `POST`/`DELETE` routes writing the DB; storefront read path unchanged | med | future |
| 13 | Final verification pass | — | proposed |

After **every** stage: `npx tsc --noEmit` && `npx eslint .` && `npm run build`,
plus the Stage 3 fixtures once they exist.

## 5. Files that will move (beyond Stage 1, if later stages run)

- Stage 5: new `src/lib/products/business-card-groups.ts`; edits to 3 route
  files + `products.ts` (no moves).
- Stage 6: possible rename `business-card-pricing-defaults.ts` →
  `pricing/tier-defaults.ts` (generic name); `business-card-quantities.ts` →
  `pricing/quantity-tiers.ts`. `git mv` + import updates only.
- Stage 11: `supabase/seed.sql` → `supabase/legacy/seed.sql`.

## 6. Files that will be consolidated

- Stage 4: `normalizeQuoteRequest` alias removed (keep `normalizeOrder`);
  `QuoteRequest` type removed if 0 refs (currently 0).
- Stage 6: price-resolution helpers currently spread across `pricing.ts` +
  `product-prices.ts` + `business-card-pricing-defaults.ts` → one cohesive
  `pricing/` API. `getProductDisplayPrice` and `calculateLinePrice` share the
  resolver so they can't disagree.
- Stage 5: 3 copies of BC group definitions → 1.

## 7. Testing strategy

No test runner is configured yet. Add one (Vitest — zero-config with the current
setup) **before Stage 6**.

**Priority coverage (capture expected outputs from current `main` first):**

1. **Pricing** — `calculateLinePrice` fixtures:
   - `business-cards-standard`: (250, no options), (500, +16pt +UV +Rounded
     +Double), (1,000, base), ("Custom order")
   - `flyers`: (500), (1,000), (2,500) — synthesized tiers
   - `custom-mugs`: (24) — flat × qty
   - `tote-bags`: (50) — flat × qty, Apparel, not in admin catalog
   - a multi-add-on business card selection
   - `normalizePricingRules` legacy shapes (`quantity_tiers`, `option_addons`)
2. **Option availability / defaults** — every active product: required fields
   list matches seed; `pricedOptionFields` excludes `need_design_help`.
3. **`options_schema` consistency** — for every option-priced slug, DB schema ==
   seed schema; every `pricing_rules` key ∈ schema values.
4. **Product routing** — `getProductBySlug` returns each of the 33 active slugs;
   returns `null` for a random string; BC group pages return the right subset.
5. **DB reads** — `getProducts()` returns 35 when Supabase up; returns
   `FALLBACK_PRODUCTS` on simulated timeout/error.
6. **Checkout recompute** — POST `/api/checkout` with tampered client
   `line_total` → order `total_amount` + Stripe line items use the
   server-recomputed value; `"Custom order"` line → 400.
7. **Admin price edit** — PATCH round-trips `price` + `pricing_rules`;
   `base_price_text` recomputed; `price <= 0` → 400.
8. **Admin order edit** — PATCH status transitions; invalid status → 400; status
   change triggers `sendOrderStatusUpdateEmail` (mock Resend).
9. **Cart totals** — `CartProvider` subtotal = Σ `line_total`.

**Manual smoke (each release):** home → PDP (BC + flyer + mug) → configure →
add to cart → cart → login → checkout → Stripe test card → success → `/account`
→ `/admin/dashboard` shows it → `/admin/prices` edit + save → PDP reflects it.

## 8. Compatibility risks

| Change | Risk | Mitigation |
|---|---|---|
| Any `src/lib` move | stale import / dynamic import missed | repo-wide grep + `tsc` + build (done for Stage 1) |
| Pricing consolidation | a checkout total shifts by cents | Stage 3 fixtures asserting exact equality; diff `getProductDisplayPrice` vs `calculateLinePrice` for all 35 |
| `enrichProductFromSeed` change | a product shows stale/empty DB title/desc | verify all 23 option-priced DB rows have non-empty title/description first |
| BC group config | a card disappears from one of 3 views | snapshot the 3 pages' product lists before/after |
| RLS migration | customers lose access to own orders, or admin breaks | staging test; explicit test matrix (CRIT-1); owner sign-off; standalone PR; easy rollback migration prepared |
| middleware change | admin lockout or auth bypass | test: non-admin blocked, admin allowed, revoked-role user blocked within one request cycle |
| Dead-code removal | dynamic/config reference missed | grep imports + routes + config + migrations; keep if unsure |
