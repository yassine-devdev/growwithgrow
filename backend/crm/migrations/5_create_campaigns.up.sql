CREATE TABLE campaigns (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('email', 'sms', 'social', 'webinar', 'event', 'direct_mail')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget DOUBLE PRECISION,
  target_audience TEXT,
  description TEXT,
  goals TEXT,
  owner_id BIGINT NOT NULL, -- User ID
  metrics JSONB, -- Store campaign metrics as JSON
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_owner ON campaigns(owner_id);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_active ON campaigns(is_active);
