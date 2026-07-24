-- Production RLS: restrict order access to owners; admin uses service role in app

DROP POLICY IF EXISTS "Public can insert quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can read quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can update quote requests" ON quote_requests;

-- Authenticated customers can read their own orders only
CREATE POLICY "Customers read own orders"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (
    email = (auth.jwt() ->> 'email')
    OR user_id = auth.uid()
  );

-- Inserts/updates go through API routes using the service role key
