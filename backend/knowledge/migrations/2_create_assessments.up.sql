CREATE TABLE assessments (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assessment_type VARCHAR(50) NOT NULL CHECK (assessment_type IN ('quiz', 'test', 'exam', 'project', 'assignment', 'survey')),
  subject VARCHAR(100) NOT NULL,
  grade_level VARCHAR(10),
  duration_minutes INTEGER,
  total_points INTEGER NOT NULL DEFAULT 100,
  passing_score INTEGER,
  instructions TEXT,
  created_by BIGINT NOT NULL,
  school_id BIGINT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessments_type ON assessments(assessment_type);
CREATE INDEX idx_assessments_subject ON assessments(subject);
CREATE INDEX idx_assessments_grade_level ON assessments(grade_level);
CREATE INDEX idx_assessments_school ON assessments(school_id);
CREATE INDEX idx_assessments_published ON assessments(is_published);
CREATE INDEX idx_assessments_active ON assessments(is_active);
