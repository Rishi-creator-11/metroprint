-- Extended quote/order workflow fields
ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS quote_amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS quote_message TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS proof_status TEXT NOT NULL DEFAULT 'not_sent'
    CHECK (proof_status IN ('not_sent', 'sent', 'approved', 'revision_requested')),
  ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT,
  ADD COLUMN IF NOT EXISTS proof_file_url TEXT,
  ADD COLUMN IF NOT EXISTS access_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS cart_items JSONB NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_quote_requests_order_number ON quote_requests(order_number);
CREATE INDEX IF NOT EXISTS idx_quote_requests_access_token ON quote_requests(access_token);