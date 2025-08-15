CREATE TABLE leaderboards (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('points', 'achievements', 'assignments', 'attendance', 'custom')),
  time_period VARCHAR(20) NOT NULL CHECK (time_period IN ('daily', 'weekly', 'monthly', 'yearly', 'all_time')),
  school_id BIGINT,
  class_id BIGINT,
  grade_level VARCHAR(10),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leaderboards_metric ON leaderboards(metric_type);
CREATE INDEX idx_leaderboards_period ON leaderboards(time_period);
CREATE INDEX idx_leaderboards_school ON leaderboards(school_id);
CREATE INDEX idx_leaderboards_class ON leaderboards(class_id);
CREATE INDEX idx_leaderboards_active ON leaderboards(is_active);
