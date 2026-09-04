# ⚠️ Migrations folder — HISTORY, not a replayable chain

_Verified against live Supabase project `tggerxbkxtnucmlrafqn` on 2026-08-29._

This folder contains ~35 `.sql` files in **two overlapping naming schemes**
(`NNN_name.sql` and `<timestamp>_NNN_name.sql`) with duplicated / superseded
content.

**Supabase's migration history registers only two of them:**

```
20260821023159  add_business_cards_category
20260821030637  add_business_card_product_imagery_and_specs
```

The **live schema contains far more** than those two describe — essentially all
of `002`–`034` (order workflow columns, `price`, `pricing_rules`, every
per-product pricing seed, apparel/business-card data, …). Those earlier changes
were applied **manually / via the SQL editor / an earlier workflow**, outside
migration tracking.

## Rules

- ❌ Do **not** delete, renumber, rename, or consolidate any file here.
- ❌ Do **not** run `supabase db reset`, `supabase db push`, or otherwise replay
  this folder against the production database — you will hit duplicate objects,
  failed constraints, or data loss.
- ❌ Do **not** assume a file here is applied. Verify against the live schema
  (`information_schema`, `mcp list_migrations`, or the Supabase dashboard).
- ✅ New schema changes → **one new timestamped migration file**, reviewed,
  applied deliberately, verified with a query, and documented in
  `docs/DATABASE_MAP.md`.
- ✅ `seed.sql` and `grant-admin.sql` are one-shot helper scripts, not part of
  any chain. `seed.sql` in particular is **stale** (older option schemas) — do
  not run it against production.

See `docs/DATABASE_MAP.md` and `docs/CODEBASE_AUDIT.md` (CRITICAL-2) for context.
