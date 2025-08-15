CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('academic', 'financial', 'attendance', 'behavior', 'custom')),
  query_config JSONB NOT NULL, -- Store report configuration as JSON
  chart_config JSONB, -- Store chart configuration as JSON
  filters JSONB, -- Store available filters as JSON
  schedule JSONB, -- Store scheduling configuration as JSON
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NOT NULL,
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_public ON reports(is_public);
CREATE INDEX idx_reports_school ON reports(school_id);
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_active ON reports(is_active);
