-- Print specifications for the artwork studio.
-- Admin-editable per product; empty object means "use code defaults".
--
-- Shape (all optional):
--   { "default": { "width": 3.5, "height": 2, "unit": "in",
--                   "bleed": 0.125, "safeMargin": 0.125, "sides": 2, "label": "3.5\" x 2\"" },
--     "bySize":  { "4\" x 6\"": { ...same shape... } } }

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS print_specs jsonb NOT NULL DEFAULT '{}'::jsonb;
