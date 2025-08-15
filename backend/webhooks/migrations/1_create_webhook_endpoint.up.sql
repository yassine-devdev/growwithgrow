CREATE TABLE webhook_endpoints (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- Array of event types to listen for
  secret VARCHAR(255), -- For webhook signature verification
  headers JSONB, -- Additional headers to send
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  retry_count INTEGER NOT NULL DEFAULT 3,
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  school_id BIGINT,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_endpoints_active ON webhook_endpoints(is_active);
CREATE INDEX idx_webhook_endpoints_school ON webhook_endpoints(school_id);
CREATE INDEX idx_webhook_endpoints_events ON webhook_endpoints USING GIN(events);
