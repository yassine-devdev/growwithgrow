CREATE TABLE integrations (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL, -- google, microsoft, zoom, etc.
  integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('sso', 'calendar', 'email', 'video', 'storage', 'lms', 'payment')),
  status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
  config JSONB NOT NULL, -- Store integration configuration
  credentials JSONB, -- Store encrypted credentials
  webhook_url TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_frequency VARCHAR(20) DEFAULT 'daily' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  error_message TEXT,
  school_id BIGINT,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_type ON integrations(integration_type);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_school ON integrations(school_id);
CREATE INDEX idx_integrations_created_by ON integrations(created_by);
