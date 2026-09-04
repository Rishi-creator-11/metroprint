-- The storefront reads `products` with the anon key, and RLS hides inactive
-- rows ("Public can read active products"). That makes an admin deactivation
-- invisible to the app, so the seed/fallback catalogue re-surfaces the product.
--
-- This SECURITY DEFINER function exposes ONLY the slug list of deactivated
-- products (data the product pages already showed publicly), so the storefront
-- can suppress their seed fallbacks and honour the deactivation.

create or replace function public.deactivated_product_slugs()
returns setof text
language sql
security definer
set search_path = public
stable
as $$
  select slug from public.products where active = false;
$$;

revoke all on function public.deactivated_product_slugs() from public;
grant execute on function public.deactivated_product_slugs() to anon, authenticated, service_role;
