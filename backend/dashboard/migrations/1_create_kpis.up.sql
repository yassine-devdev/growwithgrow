CREATE TABLE kpis (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  unit VARCHAR(50),
  category VARCHAR(100) NOT NULL,
  description TEXT,
  target_value DOUBLE PRECISION,
  trend VARCHAR(20) CHECK (trend IN ('up', 'down', 'stable')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_kpis_category ON kpis(category);
CREATE INDEX idx_kpis_school ON kpis(school_id);
CREATE INDEX idx_kpis_period ON kpis(period_start, period_end);
