# MetroPrint USA — Documentation

Start here if you are new to this repository.

| Doc | Read it for |
|---|---|
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | **Start here.** What the site does, stack, folder map, how data flows, known risks. |
| [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) | The rules to follow when building. Read before your first PR. |
| [PRODUCT_CATALOG.md](./PRODUCT_CATALOG.md) | Every active product, its options, its pricing model, where it's defined. Legacy/inactive list. |
| [PRODUCT_FLOW.md](./PRODUCT_FLOW.md) | Route map + full trace from product page → cart → checkout → paid order. |
| [PRICING_ARCHITECTURE.md](./PRICING_ARCHITECTURE.md) | Every price source, `calculateLinePrice`, which system is authoritative, worked examples. |
| [DATABASE_MAP.md](./DATABASE_MAP.md) | `products` + `quote_requests` columns, RLS, readers/writers, storage, migrations caveat. |
| [ADMIN_FEATURES.md](./ADMIN_FEATURES.md) | Everything an admin can do today, screen → API → DB → customer impact. |
| [CODEBASE_AUDIT.md](./CODEBASE_AUDIT.md) | Structural problems, CRITICAL→LOW, with why-it-matters. |
| [REFACTOR_PLAN.md](./REFACTOR_PLAN.md) | Current vs target architecture, staged migration sequence, testing strategy. |

All docs verified against the live Supabase project on **2026-08-29**. When you
change product/pricing/DB/admin behavior, update the relevant doc in the same PR.

## The three rules that matter most

1. **Server checkout is authoritative** — never make it trust client prices.
2. **Don't touch the `supabase/migrations/` folder** — it is history, not a
   replayable chain (only 2 of ~35 are registered; live schema has far more).
3. **A product lives in the DB *and* in `src/lib/products/products-data.ts`** —
   never change one without the other.
