# Codebase Audit

_2026-08-29. Classified CRITICAL / HIGH / MEDIUM / LOW. "Why it matters" is
stated for each. Nothing here has been changed except where a line says
**(FIXED 2026-08-29)**._

---

## CRITICAL

### CRITICAL-1 — `quote_requests` RLS is wide open to any authenticated user
- **What:** Live policies are the pre-`004` originals: `Admins can read quote
  requests` = `SELECT TO authenticated USING (true)` and the matching `UPDATE`.
  `migrations/004_production_rls.sql` (owner-scoped `email = auth.jwt()->>'email'
  OR user_id = auth.uid()`) was never applied to production.
- **Why it matters:** Every signed-in customer can read (and update) **every**
  order and inquiry — names, emails, phone numbers, addresses in notes, artwork
  URLs, totals — by querying `quote_requests` directly with the anon client.
  `/account` only *filters* by email in its `.eq("email", …)` query; it does not
  enforce it.
- **Fix (do deliberately, not silently):** new timestamped migration that drops
  the two `USING (true)` policies and adds the owner-scoped SELECT (and no
  UPDATE for `authenticated` — updates already go through service-role API
  routes). Test: (a) customer A cannot read customer B's order; (b) `/account`
  still shows A's orders; (c) `/admin/dashboard` still works (service role);
  (d) checkout + inquiry insert still work (`Public can insert` retained or
  replaced by service-role-only insert).
- **Do not** bundle this into an unrelated refactor commit.

### CRITICAL-2 — Migrations folder does not reflect the live database
- **What:** ~35 `.sql` files, 2 naming schemes, overlapping content; only 2
  migrations registered in Supabase history; live schema reflects ~all of
  `001`–`034`.
- **Why it matters:** Anyone running `supabase db reset`, `db push`, or replaying
  the folder against production risks duplicate objects, failed constraints, or
  **data loss**. New contributors cannot trust the folder.
- **Fix:** documented in `DATABASE_MAP.md` — freeze the folder, add a
  `supabase/migrations/README.md` stating "history only, not a replayable
  chain", adopt "new change = new timestamped migration" going forward. Consider
  a one-time `schema-baseline.sql` (generated from live) checked in for
  reference, **not** applied.

---

## HIGH

### HIGH-1 — `options_schema` defined in three places, silently reconciled
- DB `products.options_schema`, `src/lib/products/products-data.ts`
  (`SEED_PRODUCTS`), and `supabase/seed.sql`. For option-priced slugs the **seed
  (code)** overrides the DB (`enrichProductFromSeed`); `seed.sql` is stale and
  unused.
- **Why:** Editing options in the "obvious" place (DB / admin) has **no effect**
  for ~23 products. Divergence between DB and seed is invisible until a customer
  selects an option that has no price and silently gets `+$0`, or a saved
  `pricing_rules` key no longer matches any schema value.
- **Fix direction (later):** pick one source of truth per concern. Short term:
  add a dev-only assertion / test that every option-priced product's DB schema
  == seed schema, and that every `pricing_rules` key exists in the schema.

### HIGH-2 — Pricing logic split across 3 files + DB, with implicit precedence
- `pricing.ts` (`calculateLinePrice`, `normalizePricingRules`,
  `getStartingPrice`), `business-card-pricing-defaults.ts` (`resolveOptionPrices`,
  `TIER_SCALE`, `usesOptionPricing`), `product-prices.ts` (`PRODUCT_PRICES`,
  `getProductPrice`, `getProductDisplayPrice`). Circular-ish: `product-prices.ts`
  imports from `pricing.ts` **and** `business-card-pricing-defaults.ts`;
  `pricing.ts` imports from both of the others.
- **Why:** Hard to reason about which number wins; a change in one file can move
  a checkout total. `getProductDisplayPrice` (display) and `calculateLinePrice`
  (checkout) can disagree.
- **Fix direction (later):** one `pricing/` module with an explicit resolver
  (`resolvePricing(product) → { base, optionPrices }`) and a pure
  `priceLine(resolved, selections)`. **Guard with fixtures first** (see
  `PRICING_ARCHITECTURE.md` §6).

### HIGH-3 — `quote_requests` is 4 tables in a trench coat
- Orders (pending), orders (paid), inquiries, legacy quote/proof workflow — all
  one table, disambiguated by `category === 'Inquiry'` and `payment_status`.
  Dashboard query is `payment_status.eq.paid,category.eq.Inquiry`.
- **Why:** Every read needs to know the discriminator convention; legacy columns
  (`proof_status`, `access_token`, `quote_amount`, …) are dead weight and
  `NOT NULL DEFAULT` columns can't just be ignored forever.
- **Fix direction (later, low urgency — 0 real rows):** keep the table, but add a
  clear `type` column (`order` / `inquiry`) instead of overloading `category`;
  drop truly-dead legacy columns in a dedicated migration once confirmed unused.
  **Not now.**

### HIGH-4 — `middleware.ts` builds a second Supabase client + repeats auth
- `updateSession()` runs, then middleware constructs **another**
  `createServerClient` and calls `getUser()` again for `/admin/*`. Two auth
  round-trips per admin request.
- **Why:** latency + drift risk (middleware trusts `isAdminUser(session user)`;
  API/pages trust service-role `app_metadata`). If a user's admin role is
  revoked, the session copy can lag.
- **Fix direction:** have `updateSession` return the user; reuse it. Keep the
  service-role re-check on pages/routes (already centralized —
  **partially FIXED 2026-08-29**, see below).

### HIGH-5 — `flyers` is option-priced but has no saved quantity tiers
- Storefront synthesizes flyer quantity prices from `price` (49.99) × `TIER_SCALE`.
  Admin section lists flyers, so staff *think* they set flyer prices, but unless
  they Save, prices are formula-derived and may not match the real print cost.
- **Why:** silent mispricing risk on a high-volume product.
- **Fix:** owner enters real flyer quantity prices in `/admin/prices` and Saves.
  No code change needed.

---

## MEDIUM

### MEDIUM-1 — Duplicated admin-auth blocks in API routes — **(FIXED 2026-08-29)**
- Was: 4 near-identical `getUser` + `service.auth.admin.getUserById` +
  `isAdminUser` blocks in `products/[id]`, `products/by-slug/[slug]` (local
  `requireAdmin`), `quote-requests/[id]`, and `verify`.
- Now: one `resolveAdmin()` core in `src/lib/admin/admin-server.ts` with
  `requireAdminUser()` (pages) and `requireAdminApi()` (routes). The 3 mutating
  routes use `requireAdminApi()`. `verify` keeps its `{admin:boolean}` contract
  (login form depends on it). `middleware.ts` keeps its Edge-safe check.

### MEDIUM-2 — Flat `src/lib` (31 files) — **(FIXED 2026-08-29)**
- Now grouped: `lib/products/` (+`options/`), `lib/pricing/`, `lib/checkout/`,
  `lib/admin/`, plus existing `lib/supabase/`. Leaf modules (`types`,
  `constants`, `utils`, `auth`, `email`) stay at `lib/` root. All moves were
  `git mv` + import-path updates only — no behavior change. `tsc`, `eslint`,
  `next build` all green before and after.

### MEDIUM-3 — Business-card grouping logic duplicated & name-based
- `/products` (`BUSINESS_CARD_LINES`), `/business-cards/[group]` (`GROUPS`),
  `/business-cards/[group]/[slug]` (`GROUP_LABELS`), `products.ts`
  (`getBusinessCardsBySubcategory`) each encode the standard/premium/custom split
  differently — some by slug prefix, some by `subcategory`, and the DB has a
  4th value (`Specialty`, legacy).
- **Why:** add a BC line and you must edit ≥3 files consistently or a product
  vanishes from one view.
- **Fix direction:** one `BUSINESS_CARD_GROUPS` config (key, label, match fn,
  subcategory) imported everywhere.

### MEDIUM-4 — `enrichProductFromSeed` throws away DB content for 23 products
- DB `title`/`description`/`base_price_text`/`subcategory` are ignored for
  option-priced slugs. An owner editing a description in Supabase sees no change.
- **Why:** surprising; couples "has option pricing" to "identity lives in code".
- **Fix direction:** only override `options_schema` from seed, keep DB
  title/description/etc. Needs a check that DB rows have sane values first.

### MEDIUM-5 — Two fulfillment paths, subtle idempotency
- `/api/stripe/webhook` and `/api/checkout/complete` both call
  `fulfillPaidCheckoutSession`. It's written to be idempotent (checks
  `payment_status === 'paid'`), but there's a race window (both running at once
  could double-send emails; `Promise.allSettled` hides failures).
- **Why:** duplicate customer emails; masked send failures.
- **Fix direction:** advisory lock / `UPDATE … WHERE payment_status <> 'paid'
  RETURNING` gate before notifying; log allSettled rejections.

### MEDIUM-6 — `custom-hats` live price = `$1.00`
- Almost certainly a test value entered via `/admin/prices`.
- **Fix:** owner confirms real price and re-saves. Do not change the DB
  unprompted.

### MEDIUM-7 — `parseQuantityFromOptions` strips non-digits
- `"1,000"` → `1000` (good), but `"Front and Back"` in a `quantity`-named field
  would → `1`. Only safe because `quantity` is always a numeric/`"Custom order"`
  dropdown today. Fragile if a future product reuses the name.

---

## LOW

- **LOW-1** `netlify.toml` alongside `.vercel/` — pick one deploy target; delete
  the other to avoid confusion. (`netlify.toml` = 1 line.)
- **LOW-2** `QuoteRequest` type is `@deprecated` but still exported;
  `normalizeQuoteRequest` / `normalizeOrder` both exist. Consolidate once no
  imports remain (checked: only `normalizeOrder` is used).
- **LOW-3** `README.md` + `AGENTS.md` say "Next.js 16" / reference
  `node_modules/next/dist/docs/`; installed Next is 15.3.8 and that folder isn't
  present. Update the docs.
- **LOW-4** `getSeedProductsByCategory` (`products-data.ts`) is exported but
  unused. Keep or remove after a repo-wide check (currently 0 refs).
- **LOW-5** `usesSeedOptionsSchema` / `usesBusinessCardPricing` /
  `SEED_PRODUCT_ID_PREFIX` naming: `usesSeedOptionsSchema` is `@deprecated` alias
  of `isOptionPricingSlug`; `usesBusinessCardPricing` appears unused.
- **LOW-6** `seed.sql` is stale (older option schemas, `business-cards` slug
  logic). Move to `supabase/legacy/` or add a header comment "HISTORICAL — do not
  run".
- **LOW-7** Cart subtotal in `CartProvider` uses `line_total || unit_price`
  (falls back to unit price if `line_total` is 0/undefined) — a `"Custom order"`
  item (line_total 0) would show its `unit_price` (also 0) — fine today, but the
  `||` is a latent bug if `line_total` legitimately 0.
- **LOW-8** `any`/loose typing: `normalizeOrder(raw: Record<string, unknown>)`
  casts field-by-field; `admin-pricing-server.ts` `pricing_rules: unknown`.
  Acceptable but could use a `productRowSchema`. No `: any` found in app code.
- **LOW-9** Legacy `bc-*` inactive rows have real `pricing_rules` /
  `options_schema` — harmless but adds noise to DB queries. Leave.
- **LOW-10** `middleware.ts` matcher runs on nearly every route (only excludes
  static assets + a few image extensions) — every page pays the
  `updateSession` cost. Consider narrowing.

---

## Explicitly checked and NOT a problem

- No `: any` in `src/app` / `src/components` / `src/lib` app code.
- No circular import that breaks the build (`product-prices ↔ pricing ↔
  business-card-pricing-defaults` is a cycle but type-only + tree-shakeable;
  `tsc` + `next build` pass).
- Server checkout **does** recompute prices — the security-critical behavior is
  intact.
- All admin writes use the service role; `products` has no public write policy.
- No dead route handlers; every `route.ts` is reachable.
- No product slug referenced in code that is missing from the live DB (seed
  provides fallbacks for all 32 code-defined slugs; DB has 33 active incl.
  `tote-bags`).
