# Admin Features

_Verified 2026-08-29. Admin functionality MUST keep working after any refactor._

## Access model

| Piece | File | Responsibility |
|---|---|---|
| Role check | `src/lib/auth.ts` → `isAdminUser(user)` | `true` if `app_metadata.role === "admin"` (case/space-insensitive) **or** `app_metadata.is_admin === true` **or** `app_metadata.roles` contains `"admin"`. |
| Route gate | `src/middleware.ts` | For `/admin/*` except `/admin/login`: no user → redirect `/admin/login?redirect=…`; user but not admin → redirect `/admin/login?error=unauthorized`. Uses a cookie-only `createServerClient` (no service role — Edge runtime) and `isAdminUser(user)` against the **session** user. |
| Page guard | `src/lib/admin/admin-server.ts` → `requireAdminUser()` | Server-component guard. Re-checks via **service role** (`service.auth.admin.getUserById`) → authoritative `app_metadata`. Redirects on failure. Returns the `User`. |
| API guard | `src/lib/admin/admin-server.ts` → `requireAdminApi()` | Route-handler guard. Same service-role check. Returns `{ error: NextResponse(401) }` or `{ user, service }`. |
| Login | `src/app/admin/login/AdminLoginForm.tsx` + `GET /api/admin/verify` | Client signs in with Supabase, then calls `/api/admin/verify` (service-role `isAdminUser`); if not ok, signs out and shows an error. |

> `requireAdminUser` / `requireAdminApi` share one private `resolveAdmin()` core
> (added in the 2026-08-29 cleanup, replacing 4 hand-rolled copies in the API
> routes). `middleware.ts` keeps its own lighter check on purpose — Edge runtime
> can't use the service-role client. `GET /api/admin/verify` still has its own
> `{ admin: boolean }` shape because the login form depends on it — left as-is.

Security posture after cleanup: **equal or stricter** everywhere. Every mutating
admin route now goes through `requireAdminApi()`; the previous `middleware`-only
`isAdminUser(session user)` for `verify` is unchanged.

---

## Capability 1 — Orders & Inquiries dashboard

**Screen:** `/admin/dashboard` (`src/app/admin/dashboard/page.tsx`)

| Step | Detail |
|---|---|
| Component | Server component + `StatusBadge` / `PaymentBadge` / `TypeBadge` / `AdminHeader` |
| Data read | service role: `quote_requests` WHERE `payment_status = 'paid' OR category = 'Inquiry'`, ordered by `created_at desc`, normalized via `normalizeOrder()` |
| Filters (URL params) | `type` = all / orders / inquiries; `status` = pending / processing / completed / cancelled (only when a type is chosen). Counts computed in-page. |
| DB table | `quote_requests` (read only) |
| Customer impact | none (read) |

**Screen:** `/admin/dashboard/[id]` (`src/app/admin/dashboard/[id]/page.tsx` →
`AdminRequestDetail`)

| Action | Component control | API / server action | DB write | Customer-facing impact |
|---|---|---|---|---|
| Change order/inquiry **status** | status buttons | `PATCH /api/admin/quote-requests/[id]` `{status}` | `quote_requests.status` | **Sends the customer an email** via `sendOrderStatusUpdateEmail()` for `processing`/`completed`/`cancelled` (different copy for inquiries vs orders). |
| Change **payment_status** | (via `patch()` — currently only status buttons + notes are wired in the UI; payment_status is accepted by the API) | `PATCH …` `{payment_status}` | `quote_requests.payment_status` | none directly |
| Edit **internal notes** | textarea + Save | `PATCH …` `{internal_notes}` | `quote_requests.internal_notes` | none (staff-only) |
| View artwork | links / image previews | — | — | — |
| Copy customer email | copy button | — | — | — |

API validation: status ∈ 4 values; payment_status ∈ 4 values; else 400.
Guard: `requireAdminApi()`.

---

## Capability 2 — Product pricing editor

**Screen:** `/admin/prices` (`src/app/admin/prices/page.tsx` → `AdminPricingHub`)

| Step | Detail |
|---|---|
| Guard | `requireAdminUser()` |
| Data read | `loadAdminPricingSections(serviceClient)` (`src/lib/pricing/admin-pricing-server.ts`) |
| Sections | Defined in `src/lib/pricing/admin-pricing-catalog.ts` `ADMIN_PRICING_SECTIONS`: **Apparel** (`custom-t-shirt-printing`, `custom-long-sleeve-t-shirt-printing`, `custom-polo-printing`, `custom-hoodie-printing`, `custom-hats`), **Business Cards** (slug prefix `business-cards-`), **Print Materials** (`flyers`, `postcards`, `brochures`, `bookmarks`, `door-hangers`, `folders`, `posters`, `roll-up-banners`, `car-door-magnets`). |
| Not covered | `tote-bags`, all Promotional, all Marketing Services (they are not option-priced). |
| Editor UI | pick section → search / (BC: subcategory filter) → pick product → one `$` input **per option value** for every priced field (`pricedOptionFields`: select/radio fields with options, excluding `need_design_help`). Quantity inputs = total price; others = add-on. Live "From $X" preview. |
| Save | `PATCH /api/admin/products/:id` for a DB row, or `PATCH /api/admin/products/by-slug/:slug` for a seed-only product (id starts `seed:`) — the latter **inserts** the product from its seed definition. Body `{ price, pricing_rules }`. |
| DB write | `products.price`, `products.pricing_rules`, `products.base_price_text` (recomputed). |
| Customer-facing impact | **Immediate** — storefront "From" prices, PDP live prices, and **checkout totals** all read `pricing_rules`. |

API validation: `price` finite & `> 0` (else 400); `pricing_rules` run through
`normalizePricingRules`; missing `pricing_rules` column → helpful 500 pointing at
migration `016`. Guard: `requireAdminApi()` (via shared helper / local wrapper).

---

## Capability 3 — Admin session

`AdminHeader` (`src/components/admin/AdminHeader.tsx`): nav between Pricing /
Orders / View Site, and **Logout** (`supabase.auth.signOut()` client-side →
`/admin/login`).

---

## NOT currently possible in the admin UI (done via Supabase dashboard / SQL)

- Create / delete a product
- Edit a product's title, description, image, category, subcategory
- Edit a product's **option set** (`options_schema`) — and for option-priced
  products this lives in `products-data.ts` (code), not the DB
- Toggle `active` / product visibility
- Manage categories or subcategories
- Bulk price changes
- Refunds (Stripe dashboard only)
- Delete orders / inquiries
- Manage turnaround options (no turnaround concept exists in the data model yet)

`REFACTOR_PLAN.md` notes where to add full product CRUD later without disturbing
the storefront read path.
