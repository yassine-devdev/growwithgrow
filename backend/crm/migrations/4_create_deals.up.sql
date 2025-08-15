CREATE TABLE deals (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  account_id BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id BIGINT REFERENCES contacts(id),
  stage VARCHAR(50) NOT NULL DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  owner_id BIGINT NOT NULL, -- User ID
  source VARCHAR(100),
  description TEXT,
  next_step TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_account ON deals(account_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_close_date ON deals(expected_close_date);
CREATE INDEX idx_deals_active ON deals(is_active);
