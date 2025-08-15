CREATE TABLE sync_logs (
  id BIGSERIAL PRIMARY KEY,
  integration_id BIGINT NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL, -- full, incremental, webhook
  status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'cancelled')),
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER
);

CREATE INDEX idx_sync_logs_integration ON sync_logs(integration_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at);
