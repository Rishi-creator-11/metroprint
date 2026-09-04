-- Order ownership: customers may read ONLY their own orders/inquiries.
--
-- Before this migration the live policies were the permissive originals
-- (`... TO authenticated USING (true)`), so any signed-in user could read and
-- update every row in quote_requests. This scopes customer reads to
-- `user_id = auth.uid()` — the server-resolved authenticated user id that
-- POST /api/checkout already records on every order.
--
-- Admin / staff access is unaffected: /admin/* and all mutating API routes use
-- the Supabase service role, which bypasses RLS.
--
-- Reversible: re-create the two dropped policies with `USING (true)`.

DROP POLICY IF EXISTS "Admins can read quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can update quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Customers read own orders" ON quote_requests;

CREATE POLICY "Customers read own orders"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- No authenticated INSERT/UPDATE/DELETE policy: order creation and mutation go
-- through service-role API routes only. (The public INSERT policy from
-- migration 001, if still present, is left untouched — checkout/inquiry inserts
-- use the service role regardless.)
