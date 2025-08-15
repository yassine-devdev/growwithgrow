CREATE TABLE leads (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  source VARCHAR(100),
  campaign VARCHAR(100),
  estimated_value DOUBLE PRECISION,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  assigned_to BIGINT, -- User ID
  last_activity_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_contact ON leads(contact_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_score ON leads(score);
CREATE INDEX idx_leads_active ON leads(is_active);
