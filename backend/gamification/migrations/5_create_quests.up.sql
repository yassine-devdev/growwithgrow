CREATE TABLE quests (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  quest_type VARCHAR(50) NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'monthly', 'special', 'story')),
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  points_reward INTEGER NOT NULL DEFAULT 0,
  requirements JSONB NOT NULL, -- Store quest requirements as JSON
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  current_participants INTEGER NOT NULL DEFAULT 0,
  school_id BIGINT,
  class_id BIGINT,
  grade_level VARCHAR(10),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quests_type ON quests(quest_type);
CREATE INDEX idx_quests_difficulty ON quests(difficulty);
CREATE INDEX idx_quests_school ON quests(school_id);
CREATE INDEX idx_quests_class ON quests(class_id);
CREATE INDEX idx_quests_dates ON quests(start_date, end_date);
CREATE INDEX idx_quests_active ON quests(is_active);
