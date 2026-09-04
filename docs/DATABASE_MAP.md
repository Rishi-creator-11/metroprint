# Database Map

_Verified against live Supabase project `tggerxbkxtnucmlrafqn`
("priyanshudalla9@gmail.com's Project"), region us-west-2, Postgres 17, 2026-08-29._

The app uses **two `public` tables**, one storage bucket, and Supabase Auth.

---

## Table: `products`

**Purpose:** the product catalog + its pricing. `active = true` defines the live
storefront (33 of 50 rows).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()`. **Referenced by** `PATCH /api/admin/products/:id`. Seed fallbacks use synthetic ids `seed:<slug>` / `seed-<n>` in memory only. |
| `title` | text NOT NULL | Overridden by seed for option-priced slugs. |
| `slug` | text UNIQUE NOT NULL | **Stable identity.** Used in URLs, cart items, `PRODUCT_PRICES`, `admin-pricing-catalog`, `BUSINESS_CARD_IMAGES`, `POPULAR_PRODUCT_SLUGS`. Never rename. |
| `category` | text NOT NULL | One of the 6 `ProductCategory` values. |
| `subcategory` | text | Business Cards: `Standard` / `Premium` / `Custom` (active) or `Specialty` (legacy). NULL elsewhere. Storefront BC grouping uses slug prefix, not this. |
| `description` | text NOT NULL default '' | Overridden by seed for option-priced slugs. |
| `base_price_text` | text NOT NULL default 'Request a quote' | Display only. Auto-written on admin price save. |
| `image_url` | text | Unsplash/Pexels URLs. BC images additionally hard-overridden in code. |
| `options_schema` | jsonb NOT NULL default `{"fields":[]}` | `{ fields: OptionField[] }`. **Overridden by seed** for option-priced slugs; authoritative for the rest. |
| `active` | boolean NOT NULL default true | Storefront filter. 15 rows are `false` (legacy). |
| `price` | numeric(10,2) | Base price. Added by migration `006`. Null → falls back to `PRODUCT_PRICES`. |
| `pricing_rules` | jsonb NOT NULL default `{}` | `{ option_prices: { field: { value: number } } }`. Added by migration `016`. 23 active rows populated. |
| `created_at` | timestamptz NOT NULL default now() | |

**RLS:** enabled. Policies (live):
- `Public can read active products` — `SELECT USING (active = true)`
- `Admins can read all products` — `SELECT TO authenticated USING (true)`
- **No INSERT/UPDATE/DELETE policy** → all writes go through the **service role**
  (admin API routes). Correct.

**Read by:** `src/lib/products/products.ts` (all storefront reads, `active=true`,
3s timeout, fallback to `SEED_PRODUCTS`); `src/lib/pricing/admin-pricing-server.ts`
(admin pricing screen); `src/app/api/checkout/route.ts` (checkout recompute —
selects `slug, price, pricing_rules, category, options_schema` by slug list).

**Written by:** `PATCH /api/admin/products/[id]` and
`PATCH /api/admin/products/by-slug/[slug]` only — `price`, `pricing_rules`,
`base_price_text`. The by-slug route can also **INSERT** a row from the seed
definition the first time a seed-only product is priced.

**Affects:** products ✔  pricing ✔  admin ✔

---

## Table: `quote_requests`

**Purpose (combined / historical):** this one table is:
1. **Paid orders** from Stripe checkout (`cart_items`, `total_amount`,
   `stripe_session_id`, `payment_status='paid'`).
2. **Pending orders** created just before Stripe redirect
   (`payment_status='pending'`).
3. **Inquiries** — `/request-quote` submissions, `category='Inquiry'`,
   `payment_status='unpaid'`.
4. **Legacy quote workflow** — unused columns from an earlier proof/quote design.

Live row count: **~15** (all dated 2026-06-22..24 — test data, not real customer
history). Mix of paid orders, pending, and 2 inquiries.

| Column | Type | Used today? | Notes |
|---|---|---|---|
| `id` | uuid PK | ✔ | Admin detail route `/admin/dashboard/[id]`, `PATCH /api/admin/quote-requests/[id]`. |
| `customer_name`, `email`, `phone`, `company_name` | text | ✔ (email/name/phone) | `email` also drives `/account` order history + RLS. |
| `product_name` | text NOT NULL | ✔ | `"Order (N items)"` / product title / `"Custom Quote Inquiry"`. |
| `category` | text NOT NULL | ✔ | Single category, `"Multiple"`, or `"Inquiry"` (the inquiry discriminator — see `order-utils.ts`). |
| `selected_options` | jsonb | ✔ (single-item orders) | `{}` for multi-item / inquiries. |
| `cart_items` | jsonb (default `[]`) | ✔ | The full `CartItem[]` snapshot — the real order contents. Added by migration `002`. |
| `notes` | text | ✔ | Customer order notes / inquiry message. |
| `file_urls` | jsonb (default `[]`) | ✔ | Flat list of artwork URLs (also embedded per-item in `cart_items`). |
| `status` | text NOT NULL default 'pending' | ✔ | `pending / processing / completed / cancelled` (+ legacy `quoted / approved` allowed by the live CHECK). Admin-editable. |
| `internal_notes` | text | ✔ | Admin-only free text. |
| `payment_status` | text NOT NULL default 'unpaid' | ✔ | `unpaid / pending / paid / refunded`. Added by `002`. |
| `total_amount` | numeric(10,2) | ✔ | Server-computed order total. Added by `003`. |
| `stripe_session_id` | text | ✔ | Unique (partial index). Added by `003`. |
| `user_id` | uuid | ✔ | Supabase auth uid. Added by `003`. Also used in RLS (migration `004`, not live). |
| `order_number` | text UNIQUE | ✔ | `MP-YYYYMMDD-NNNN` (`order-utils.ts`). |
| `created_at` | timestamptz | ✔ | Dashboard ordering. |
| `quote_amount` | numeric | ✖ legacy | From `002`. |
| `quote_message` | text | ✖ legacy | |
| `proof_status` | text NOT NULL default 'not_sent' | ✖ legacy | CHECK `not_sent/sent/approved/revision_requested`. |
| `stripe_payment_link` | text | ✖ legacy | |
| `proof_file_url` | text | ✖ legacy | |
| `access_token` | text UNIQUE | ✖ legacy | Was for tokenized guest order access. |

**RLS:** enabled. Policies (live — **these are the pre-004 originals**):
- `Public can insert quote requests` — `INSERT WITH CHECK (true)`
- `Admins can read quote requests` — `SELECT TO authenticated USING (true)`
- `Admins can update quote requests` — `UPDATE TO authenticated USING (true)`

> ⚠️ **Security drift.** `migrations/004_production_rls.sql` was meant to replace
> the two `authenticated USING (true)` policies with an owner-scoped
> `USING (email = auth.jwt()->>'email' OR user_id = auth.uid())`. **It is not
> applied on production.** Right now **any signed-in user can read and update
> every order/inquiry row** via the anon client. `/account` only *filters* by
> email in its query — it does not *enforce* it. See `CODEBASE_AUDIT.md`
> CRITICAL-1. All server writes correctly use the service role regardless.

**Read by:** `/account` (anon client, filter `email` + `payment_status=paid`);
`/admin/dashboard` + `/admin/dashboard/[id]` (service role);
`src/lib/checkout/fulfill-order.ts` (service role).

**Written by:** `POST /api/checkout` (insert pending order, service role);
`POST /api/inquiries` (insert inquiry, service role);
`src/lib/checkout/fulfill-order.ts` (mark paid / legacy insert, service role);
`PATCH /api/admin/quote-requests/[id]` (status / payment_status / internal_notes,
service role).

**Affects:** products ✖  pricing ✖  admin ✔ (this is the admin's main workload)

---

## Storage: bucket `quote-artwork` (public)

Created in migration `001`. Path convention
`artwork/<userId>/<uploadId>/<timestamp>-<sanitizedFilename>`.
- **Write:** `POST /api/upload-artwork` (auth required; service role does the
  upload; 5 files max, 25 MB each, extension allowlist in
  `src/lib/constants.ts`).
- **Read:** public URLs, surfaced in cart / checkout / admin order detail.
- Policies (from `001`): public insert + public read on `bucket_id =
  'quote-artwork'`, admin (authenticated) full access.

---

## Auth

Supabase Auth (email/password). Customer sign-up via `/signup`
(`full_name` in `user_metadata`). Admin = `app_metadata.role = "admin"` (or
`is_admin: true`, or `roles` array containing `"admin"`) — see
`src/lib/auth.ts` `isAdminUser()`. Grant with `supabase/grant-admin.sql`.

Advisor note (2026-08-29): "Leaked Password Protection Disabled" — WARN only,
enable in the Supabase Auth dashboard.

---

## Migrations — READ THIS

`supabase/migrations/` holds **~35 `.sql` files** in **two overlapping naming
schemes**:
- `001_initial.sql` … `034_apparel_quantities.sql` (sequential)
- `20260821014617_001_initial.sql` … `20260821030637_...` (timestamped
  re-imports of the early ones + the two real ones)

Supabase's **migration history registers only two**:
`20260821023159 add_business_cards_category`, `20260821030637
add_business_card_product_imagery_and_specs`.

The live schema contains **far more** than those two describe (all of
`002`–`034`'s columns and data exist). Conclusion: earlier changes were applied
manually / via SQL editor / an earlier workflow, outside migration tracking.

**Rules:**
- Do **not** delete, renumber, or consolidate existing migration files.
- Do **not** `supabase db reset` or replay the folder against production.
- Do **not** assume a local migration is applied — verify with
  `list_migrations` / `information_schema`.
- New schema changes → **one new timestamped migration**, applied deliberately,
  verified, and documented here.

Tables/columns/ids/relationships must **not** be renamed — production slugs and
ids are referenced across code and (historically) in orders.
