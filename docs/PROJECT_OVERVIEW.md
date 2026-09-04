# MetroPrint USA — Project Overview

> Onboarding document. If you have never seen this repo, read this first, then
> `DEVELOPMENT_RULES.md`, then the topic docs referenced below.

_Last verified against the live Supabase project (`tggerxbkxtnucmlrafqn`) on 2026-08-29._

---

## 1. What this website does

MetroPrint USA is a **custom‑printing / marketing e‑commerce site**. Customers:

1. Browse a catalog of ~33 products across 5 categories (business cards, print
   materials, apparel, promotional products, marketing services).
   _(DTF Printing was removed 2026-08-29.)_
2. Open a product page and **configure options** (quantity, size, stock, finish,
   colour, sides, …). A live price updates as they choose.
3. Optionally **upload artwork** (PDF / PNG / JPG / AI / PSD / EPS / SVG).
4. Add to a **local cart** (localStorage — no server cart).
5. Sign in (Supabase Auth) and **check out**. The server **recalculates every
   line price from current product data** (never trusts the browser total),
   creates a pending order row, and redirects to **Stripe Checkout**.
6. On payment, a Stripe webhook + a success‑page callback mark the order `paid`
   and send confirmation e‑mails (Resend).

Two flows bypass Stripe:
- **Custom‑quantity orders** ("Custom order" in the quantity dropdown) — routed to
  the quote/inquiry flow instead of checkout.
- **Request a Quote** (`/request-quote`) — a plain contact form that writes an
  `Inquiry` row and e‑mails the shop.

An **admin area** (`/admin`) lets staff manage orders/inquiries and edit
per‑option product pricing.

---

## 2. Technology stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15.3.8**, App Router, **Turbopack** (dev + build) | `next.config.ts`. React 19. `AGENTS.md` warns the API surface differs from older Next — check `node_modules/next/dist/docs/` before writing framework code (that folder is currently absent in this install). |
| Language | TypeScript 5, `strict: true` | Path alias `@/* → src/*` (`tsconfig.json`). |
| Styling | Tailwind CSS 4 (`@tailwindcss/postcss`) | Design tokens (`navy`, `primary`, `muted`, `surface`, `border`, `accent`) in `src/app/globals.css`. **Do not restyle** during refactors. |
| Database / Auth / Storage | **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) | Postgres 17. Storage bucket `quote-artwork` (public). |
| Payments | **Stripe** (`stripe` v22), Checkout Sessions (`mode: payment`) | |
| E‑mail | **Resend** (`resend` v6) | Optional — silently no‑ops if `RESEND_API_KEY` unset. |
| Icons | `lucide-react` | |
| Deploy | **Vercel** (`.vercel/` present). `netlify.toml` also exists (legacy/secondary). | |

### Environment variables (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL           # required
NEXT_PUBLIC_SUPABASE_ANON_KEY      # required
SUPABASE_SERVICE_ROLE_KEY          # required for checkout / admin writes / uploads
RESEND_API_KEY / RESEND_FROM_EMAIL / NOTIFICATION_EMAIL   # optional (email)
STRIPE_SECRET_KEY                  # required for checkout
STRIPE_WEBHOOK_SECRET              # required for the webhook route
NEXT_PUBLIC_SITE_URL              # required in prod (Stripe redirect URLs, SEO)
```

If Supabase env vars are missing, the app falls back to bundled TypeScript
product data (see §4) and still renders.

---

## 3. Folder structure

```
src/
  app/                         # App Router routes (see PRODUCT_FLOW.md for the map)
    page.tsx                   # home
    products/ , business-cards/# storefront catalog + PDP
    cart/ , checkout/          # cart (client) + checkout (client) + /checkout/success
    account/ , login/ , signup/# customer auth + order history
    request-quote/ , contact/  # inquiry form + static contact
    privacy/ , terms/          # static legal
    admin/                     # login, dashboard (orders/inquiries), prices
    api/                       # route handlers (checkout, stripe webhook,
                               #   upload-artwork, inquiries, admin/*)
    sitemap.ts , robots.ts , error.tsx , not-found.tsx
  components/
    layout/  products/  admin/  orders/  cart/  ui/
  lib/
    products/                  # product catalog + fallback + option schemas
      products.ts              #   read layer (Supabase + fallback merge)
      products-data.ts         #   SEED_PRODUCTS fallback catalog (~34 defs)
      product-prices.ts        #   PRODUCT_PRICES flat map + price helpers
      options/                 #   per-product OptionsSchema builders (11 files)
    pricing/                   # pricing engine
      pricing.ts               #   calculateLinePrice() — the authoritative calc
      business-card-pricing-defaults.ts  # synthesized option-price defaults
      business-card-quantities.ts        # shared quantity tiers + "Custom order"
      admin-pricing-catalog.ts # which products are option-priced / admin-editable
      admin-pricing-server.ts  # loads admin pricing screen data
    checkout/                  # stripe.ts, stripe-checkout.ts, stripe-metadata.ts,
                               #   fulfill-order.ts, order-utils.ts, artwork.ts,
                               #   quote-normalize.ts
    admin/admin-server.ts      # requireAdminUser() (pages) + requireAdminApi() (routes)
    supabase/                  # server.ts (SSR + service client), client.ts, middleware.ts
    auth.ts                    # isAdminUser(), sanitizeRedirectPath()
    email.ts                   # all Resend templates
    constants.ts               # SITE_NAME, NAV_LINKS, CATEGORIES, CONTACT_INFO, file types
    types.ts                   # Product, OptionsSchema, CartItem, Order, ...
    utils.ts                   # cn()
  middleware.ts                # gates /admin/* (auth + admin role)
supabase/
  migrations/                  # ~35 .sql files — HISTORICAL, not fully applied (see below)
  seed.sql , grant-admin.sql
docs/                          # this documentation set
```

> **Naming caveat:** folder/file names are mostly accurate after the 2026‑08‑29
> reorg, but a few helpers named `business-card-*` are generic (used by all
> option‑priced products, not just business cards).

---

## 4. The product system (summary — full detail in `PRODUCT_CATALOG.md`)

There are **two layers**, by design:

| Layer | Where | Role |
|---|---|---|
| **Supabase `products` table** | live DB | **Authoritative** live catalog + pricing. `active = true` defines the current storefront (33 rows, 5 categories). 17 inactive rows — 15 legacy generations + 2 DTF products deactivated 2026-08-29 — kept, never served. |
| **TypeScript `SEED_PRODUCTS`** | `src/lib/products/products-data.ts` | Fallback when Supabase is unreachable/unconfigured, **and** the source of truth for `options_schema` of option‑priced products (see next). |

**Read path:** `src/lib/products/products.ts`
- `getProducts()` / `getProductBySlug()` query Supabase (`active = true`, 3 s
  timeout). On any failure → `FALLBACK_PRODUCTS` (mapped from `SEED_PRODUCTS`).
- For **option‑priced slugs** (`isOptionPricingSlug`, see `admin-pricing-catalog.ts`)
  the DB row's `title / description / options_schema / base_price_text /
  subcategory` are **overridden with the seed definition** (`enrichProductFromSeed`).
  So for those products the *option set* lives in code; only *prices* and
  *active* come from the DB.
- `mergeWithFallback()` appends any seed product missing from the DB result.
- Business‑card images are injected from a hard‑coded `BUSINESS_CARD_IMAGES` map.

**Options** are a flat list of fields:
`{ name, label, type: "select"|"radio"|"text"|"textarea", options?, required?, placeholder? }`.
Every configurable product also gets a non‑priced `need_design_help` Yes/No field
(`withDesignHelpField`). Option schema builders live in `src/lib/products/options/`.

---

## 5. The pricing system (summary — full detail in `PRICING_ARCHITECTURE.md`)

Resolution order for a product's option prices:

1. **`products.pricing_rules.option_prices`** (DB, admin‑entered) — richest source.
   Shape: `{ [fieldName]: { [optionValue]: number } }`. `quantity` values are the
   **total order price** for that quantity; every other option value is an
   **add‑on** applied when selected.
2. **Synthesized defaults** (`business-card-pricing-defaults.ts`) — for
   option‑priced products with no saved quantity tiers, quantity prices are
   derived from `price` × a fixed `TIER_SCALE` anchored on 500. Non‑quantity
   options default to `+$0`.
3. **`products.price`** (DB numeric) or **`PRODUCT_PRICES[slug]`**
   (`product-prices.ts`, flat fallback map) or the constant `29.99`.
   For non‑option‑priced products the line total is `price × quantity`.

The single calculation function is **`calculateLinePrice()`** in
`src/lib/pricing/pricing.ts`. It is used **both** client‑side (live preview in
`ProductAddToCart`) **and** server‑side (`/api/checkout`).

**Security‑critical:** `/api/checkout` re‑fetches every product from Supabase and
re‑runs `calculateLinePrice()` for every cart line. The browser's `unit_price` /
`line_total` are **discarded**. Stripe line items are built from the
server‑recomputed totals. **Never change this to trust client values.**

---

## 6. Database (summary — full detail in `DATABASE_MAP.md`)

Two application tables in `public`:

- **`products`** — `id, title, slug (unique), category, subcategory, description,
  base_price_text, image_url, options_schema (jsonb), active, price (numeric),
  pricing_rules (jsonb), created_at`. 50 rows / 33 active. RLS on.
- **`quote_requests`** — the combined **orders + inquiries + legacy quote**
  table. Paid Stripe orders, `category='Inquiry'` contact submissions, and unused
  legacy proof/quote columns all live here. RLS on. ~15 rows (June 2026 test
  data).

Storage bucket **`quote-artwork`** (public) holds uploaded artwork at
`artwork/<userId>/<uploadId>/<ts>-<filename>`.

**Migrations:** `supabase/migrations/` contains ~35 `.sql` files with **two
different naming schemes** (`NNN_name.sql` and `<timestamp>_NNN_name.sql`) and
overlapping content. Supabase's migration history registers **only two**
(`20260821023159`, `20260821030637`). The live schema clearly reflects far more
than those two — earlier changes were applied manually / out of band. **Treat the
migrations folder as history: do not renumber, delete, consolidate, or replay it.**
New schema changes = brand‑new timestamped migration, applied deliberately.

---

## 7. Admin system (summary — full detail in `ADMIN_FEATURES.md`)

- **Auth:** admin = a Supabase auth user whose `app_metadata` contains
  `role: "admin"` (or `is_admin: true`, or `roles: [...,"admin"]`) — see
  `isAdminUser()` in `src/lib/auth.ts`. Set via `supabase/grant-admin.sql`.
- **Gate:** `src/middleware.ts` blocks `/admin/*` (except `/admin/login`) for
  non‑admins. Pages additionally call `requireAdminUser()`; API routes call
  `requireAdminApi()` (both in `src/lib/admin/admin-server.ts`).
- **What admins can do today:**
  - `/admin/dashboard` — list/filter paid orders + inquiries; open one; change
    `status` (pending/processing/completed/cancelled), change `payment_status`,
    edit `internal_notes`. Status changes e‑mail the customer.
  - `/admin/prices` — for Apparel (5 slugs), Business Cards (all), and Print
    Materials (9 slugs): pick a product, set a price for **every option value**,
    save. Writes `products.price` + `products.pricing_rules` + `base_price_text`.
- **No full product CRUD** (create/delete products, edit descriptions/images/
  option sets, toggle `active`) exists in the UI yet. Those are done in the
  Supabase dashboard or SQL.

---

## 8. How information flows (one paragraph)

`Supabase products row` → `getProductBySlug()` (with seed enrichment + fallback)
→ product page renders `options_schema` → customer selections feed
`calculateLinePrice(price, pricing_rules, selections)` for a live total →
`addItem()` stores a `CartItem` in `localStorage` → `/checkout` POSTs the cart to
`/api/checkout` → server re‑loads products, **re‑computes every line**, inserts a
`quote_requests` row (`status=pending`, `payment_status=pending`), creates a
Stripe Checkout Session from the recomputed totals → customer pays on Stripe →
`checkout.session.completed` webhook **and** `/api/checkout/complete` (called by
`/checkout/success`) run `fulfillPaidCheckoutSession()` → row becomes
`payment_status=paid`, `status=processing` → confirmation + admin e‑mails →
customer sees the order under `/account`; staff sees it under `/admin/dashboard`.

---

## 9. Known risks / sharp edges

See `CODEBASE_AUDIT.md` for the full list. The ones to internalise before
touching anything:

1. **RLS drift on `quote_requests`.** The live policies are the permissive
   originals (`authenticated` can `SELECT`/`UPDATE` **all** rows).
   `migrations/004_production_rls.sql` (owner‑scoped SELECT) was never applied to
   production. Any signed‑in user can currently read every order. Fix = a new
   migration, applied deliberately + tested — **not** a silent change.
2. **The pricing stack** (`pricing.ts` + `business-card-pricing-defaults.ts` +
   `product-prices.ts` + DB `pricing_rules`) is subtle. Capture regression
   fixtures before editing (see `docs/` / tests).
3. **Seed vs DB `options_schema`** for option‑priced products: the seed wins.
   Editing option lists means editing `products-data.ts`, not the DB.
4. **Migrations folder ≠ live schema.** See §6.
5. `quote_requests` carries unused legacy columns (`quote_amount`,
   `proof_status`, `access_token`, …). Don't drop them yet.
6. Some live prices look like test values (`custom-hats` = `$1.00`). Confirm with
   the owner before "correcting" anything in the DB.
