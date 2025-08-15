CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  assessment_id BIGINT REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank', 'matching')),
  options JSONB, -- Store answer options as JSON for multiple choice, matching, etc.
  correct_answer TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_assessment ON questions(assessment_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_order ON questions(order_index);
CREATE INDEX idx_questions_active ON questions(is_active);
