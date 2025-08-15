CREATE TABLE achievements (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  category VARCHAR(100) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  badge_color VARCHAR(20) DEFAULT 'bronze',
  criteria JSONB NOT NULL, -- Store achievement criteria as JSON
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_points ON achievements(points);
CREATE INDEX idx_achievements_school ON achievements(school_id);
CREATE INDEX idx_achievements_active ON achievements(is_active);
