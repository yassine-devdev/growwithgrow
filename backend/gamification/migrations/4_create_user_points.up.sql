CREATE TABLE user_points (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  reason VARCHAR(255),
  category VARCHAR(100),
  reference_id BIGINT, -- Reference to assignment, quiz, etc.
  reference_type VARCHAR(50), -- Type of reference (assignment, quiz, etc.)
  school_id BIGINT,
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_points_user ON user_points(user_id);
CREATE INDEX idx_user_points_category ON user_points(category);
CREATE INDEX idx_user_points_reference ON user_points(reference_id, reference_type);
CREATE INDEX idx_user_points_school ON user_points(school_id);
CREATE INDEX idx_user_points_awarded_at ON user_points(awarded_at);
