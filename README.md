# MetroPrint USA

A custom-printing and marketing e-commerce storefront built with Next.js and Supabase — product configuration, artwork uploads, Stripe checkout, and an admin dashboard for order and pricing management.

## What it does

Customers browse a catalog of 30+ printing and marketing products, configure per-product options (quantity, size, finish, color, etc.) with a live price that updates as they choose, optionally upload artwork, and check out through Stripe. Orders that don't fit a fixed price (custom quantities, general inquiries) route to a quote-request flow instead. Staff manage orders and per-option pricing from an admin dashboard gated by role-based access control.

## Architecture

```text
Customer selects options  →  calculateLinePrice() (client)  →  live price preview
                                        │
                                        ▼
                              POST /api/checkout
                                        │
                    server re-fetches product + pricing_rules
                    and re-runs calculateLinePrice() per line   ← client totals are never trusted
                                        │
                                        ▼
                         Stripe Checkout Session created
                                        │
                    checkout.session.completed webhook
                                        │
                                        ▼
                order marked paid → confirmation email (Resend)
                → visible under /account (customer) and /admin/dashboard (staff)
```

The product catalog has two layers by design: a live Supabase `products` table is the source of truth for pricing and availability, with a bundled TypeScript catalog as both a fallback (if Supabase is unreachable) and the source of option definitions for configurable products. This keeps checkout resilient to a database outage without ever trusting a stale or client-supplied price — every line item is recomputed server-side from the current database state before a Stripe session is created.

## Features

- **Product catalog** — 30+ products across 5 categories, each with a configurable options schema (quantity, size, finish, color, sides, etc.)
- **Live pricing engine** — a single pricing function (`calculateLinePrice`) shared between the client-side preview and the server-side checkout recompute, so the two can never disagree
- **Artwork uploads** — multi-file uploads (PDF, PNG, JPG, AI, PSD, EPS, SVG) to Supabase Storage, validated by size and extension
- **Stripe checkout** — server-authoritative pricing; the browser's cart total is discarded and every line is recalculated from the database before the Stripe session is built
- **Quote/inquiry flow** — a separate path for custom-quantity and general inquiries that don't map to a fixed catalog price
- **Admin dashboard** — role-gated order and inquiry management (status updates, internal notes, customer emails on status change) and a per-option pricing editor
- **Email notifications** — order confirmations and status updates via Resend

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack), React 19, TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Database / Auth / Storage | Supabase (Postgres, Auth, Storage) |
| Payments | Stripe Checkout |
| Email | Resend |
| Testing | Vitest |
| Deployment | Vercel |

## Access control

Admin routes (`/admin/*`) are gated at three layers: edge middleware checks the session user's role before rendering anything, server components re-verify against the service-role client before loading admin data, and every admin API route independently re-checks authorization before writing. Row-level security is enabled on both application tables in Postgres.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/` via the SQL Editor
3. Run `supabase/seed.sql` to populate products
4. Create an admin user, then grant admin access with `supabase/grant-admin.sql`

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase, Stripe, and (optional) Resend keys — see `.env.example` for the full list. If Supabase env vars are left unset, the app falls back to a bundled product catalog and still renders, though checkout requires Stripe keys regardless.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin dashboard.

## Testing

```bash
npm test              # full suite (Vitest)
npm run test:pricing   # pricing engine only
npm run test:watch
```

The pricing engine (`calculateLinePrice`) has dedicated unit coverage, since it's the one function both the live price preview and the checkout total depend on.

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — categories, popular products, how it works |
| `/products` | Full catalog with category filters |
| `/products/[slug]` | Product page with live-priced configuration form |
| `/request-quote` | General quote/inquiry form |
| `/contact` | Contact information |
| `/admin/login` | Admin authentication |
| `/admin/dashboard` | Order and inquiry management |
| `/admin/prices` | Per-option pricing editor |

## Deployment (Vercel)

1. Push to GitHub
2. Import the project in Vercel
3. Add environment variables from `.env.example`
4. Deploy

## License

Private — MetroPrint USA
