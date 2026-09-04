# MetroPrint Development Rules

Short, enforceable rules for building on this codebase. Read `PROJECT_OVERVIEW.md`
first for the "why".

## Products & catalog

1. **A product lives in two layers** — the Supabase `products` row and (for
   option-priced products) the `SEED_PRODUCTS` entry in
   `src/lib/products/products-data.ts`. Never add/change a product in only one
   layer. Check both. For option-priced slugs the seed `options_schema` is what
   the storefront uses.
2. **Never introduce a third product catalog.** Supabase = live/editable data.
   TypeScript seed = dev fallback + option-schema source. `supabase/seed.sql` is
   historical — do not treat it as current, do not extend it.
3. **Slugs are permanent identity.** Unique, stable, lowercase-kebab. Never
   rename a slug — it's in URLs, cart items, `PRODUCT_PRICES`,
   `admin-pricing-catalog`, image maps, and (historically) order rows.
4. **Never delete inactive (`active=false`) product rows.** They are legacy
   generations. To retire a product, set `active=false` (via SQL/dashboard). To
   revive a retired concept, create a **new** `business-cards-*`/current-scheme
   row + seed def — don't just flip an old `bc-*` row.
5. **Don't casually change** product names, descriptions, option labels, option
   values, quantity lists, or images. These are customer-facing business data.
   If a change is intended, it must be deliberate and noted in the PR + relevant
   doc.
6. New product options: keep `options_schema` and `pricing_rules` **consistent** —
   every priced option value must exist in the schema, and
   `/admin/prices` must never expose an option the product doesn't actually
   support (it derives fields from the schema, so keep the schema honest).

## Pricing

7. **Server checkout is authoritative.** `/api/checkout` recomputes every line
   from current Supabase data via `calculateLinePrice()`. Never make checkout
   trust client `unit_price` / `line_total` / `quantity`, `localStorage`, or
   client-calculated option prices.
8. **Never hardcode a price in a UI component.** Prices come from the DB
   (`price`, `pricing_rules`) with `PRODUCT_PRICES` / `TIER_SCALE` as fallback.
   All price math goes through `src/lib/pricing/`.
9. **Don't change pricing formulas or `pricing_rules` values** without
   regression fixtures proving identical output (see
   `PRICING_ARCHITECTURE.md` §6). The hardcoded `PRODUCT_PRICES` map is a
   fallback, **not** the source of truth when richer DB pricing exists.
10. `quantity` option values in `pricing_rules` are **total order price**; all
    other option values are **add-ons** applied when selected. Keep that
    contract.

## Database & migrations

11. **Never rewrite, renumber, delete, or consolidate existing Supabase
    migrations.** The folder is history, not a replayable chain (only 2 are
    registered; the live schema has far more). See `DATABASE_MAP.md`.
12. **Never `supabase db reset` / replay the migrations folder against
    production.** Don't assume a local migration is applied — verify against the
    live schema.
13. New schema changes = **one new timestamped migration**, reviewed, applied
    deliberately, verified with a query, and documented in `DATABASE_MAP.md`.
14. **Don't drop `quote_requests` legacy columns** (`quote_amount`,
    `proof_status`, `access_token`, `stripe_payment_link`, `proof_file_url`,
    `quote_message`) yet — do it in a dedicated, confirmed migration later.
15. **Don't rename** tables, columns, ids, or relationships.
16. RLS / policy changes are **security changes** — separate PR, explicit
    review, tested for both "customer can't see others' data" and "existing
    flows still work". Never a side effect of another change.

## Auth & admin

17. Admin authorization: pages use `requireAdminUser()`, API routes use
    `requireAdminApi()` (both `src/lib/admin/admin-server.ts`). `middleware.ts`
    keeps its own Edge-safe gate. Any new admin route MUST call
    `requireAdminApi()`. Security must stay **equal or stricter**.
18. Admin role is `app_metadata.role = "admin"` (see `isAdminUser`). Don't move
    it to `user_metadata` (client-writable) or to a DB table without updating
    `isAdminUser` + all guards.
19. Don't expose new admin capability without a guard and without a
    `ADMIN_FEATURES.md` entry.

## Refactoring hygiene

20. **Move, don't rewrite.** File reorganization = `git mv` + import updates
    only. No behavior/API/route/schema changes in a "reorg" commit.
21. After any structural change run **`npx tsc --noEmit` + `npx eslint .` +
    `npm run build`**. All must pass. Do not claim success on a red build.
22. After moving/renaming files, grep the whole repo for stale references:
    imports, dynamic imports, route strings, slugs, config keys, doc mentions.
23. **Preserve routes.** Renaming an implementation file must not change a URL.
24. Don't delete a file as "unused" until you've checked: imports, dynamic
    imports, route handlers, API fetch strings, slug references, config,
    migrations, admin references. If unsure, keep it and list it in
    `CODEBASE_AUDIT.md` under LOW.
25. Keep fallback behavior (Supabase-down → seed data) working. Don't remove it
    while the site is still in active development.

## UI

26. This is an architecture/data effort — **do not redesign the visual
    appearance**. Keep existing styling, tokens (`navy`/`primary`/`muted`/…),
    and UX. UI edits only to fix a verified functional bug.

## Process

27. Keep commits small and traceable — one concern each (docs; reorg; auth
    cleanup; a feature). Don't mix a security fix into a refactor.
28. Inspect `git status` before large changes; never discard uncommitted work.
29. When working on a specific product ("fix Flyers pricing", "add a business
    card"), check the **live Supabase row** (`execute_sql`) before editing code —
    don't infer DB state from the fallback data.
