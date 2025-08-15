CREATE TABLE analytics_data (
  id BIGSERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DOUBLE PRECISION NOT NULL,
  dimensions JSONB, -- Store additional dimensions as JSON
  date DATE NOT NULL,
  hour INTEGER, -- For hourly data
  source VARCHAR(100), -- google_analytics, facebook, etc.
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_data_metric ON analytics_data(metric_name);
CREATE INDEX idx_analytics_data_date ON analytics_data(date);
CREATE INDEX idx_analytics_data_source ON analytics_data(source);
CREATE INDEX idx_analytics_data_school ON analytics_data(school_id);
