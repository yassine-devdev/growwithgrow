CREATE TABLE user_growth (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  new_users INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  total_users INTEGER NOT NULL DEFAULT 0,
  user_type VARCHAR(50) CHECK (user_type IN ('student', 'teacher', 'parent', 'admin')),
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_growth_date ON user_growth(date);
CREATE INDEX idx_user_growth_school ON user_growth(school_id);
CREATE INDEX idx_user_growth_type ON user_growth(user_type);
