CREATE TABLE accounts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('school', 'district', 'organization', 'individual')),
  industry VARCHAR(100),
  size VARCHAR(50) CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
  annual_revenue DOUBLE PRECISION,
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  primary_contact_id BIGINT REFERENCES contacts(id),
  account_manager_id BIGINT, -- User ID
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect', 'customer')),
  tags TEXT[],
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_manager ON accounts(account_manager_id);
CREATE INDEX idx_accounts_contact ON accounts(primary_contact_id);
CREATE INDEX idx_accounts_active ON accounts(is_active);
