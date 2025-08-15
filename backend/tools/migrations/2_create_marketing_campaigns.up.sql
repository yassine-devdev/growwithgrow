CREATE TABLE marketing_campaigns (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('email', 'sms', 'social', 'seo', 'ads', 'content')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  target_audience JSONB, -- Store audience targeting as JSON
  content JSONB, -- Store campaign content as JSON
  settings JSONB, -- Store campaign settings as JSON
  metrics JSONB, -- Store campaign metrics as JSON
  budget DOUBLE PRECISION,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by BIGINT NOT NULL,
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_marketing_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_school ON marketing_campaigns(school_id);
CREATE INDEX idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);
