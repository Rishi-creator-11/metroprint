-- Simplify orders for direct checkout (run after 002)
ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS user_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_quote_requests_stripe_session_id
  ON quote_requests(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Allow new simplified statuses
ALTER TABLE quote_requests DROP CONSTRAINT IF EXISTS quote_requests_status_check;
ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_status_check
  CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'quoted', 'approved'));
