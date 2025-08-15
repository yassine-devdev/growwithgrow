CREATE TABLE curriculum (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,
  standards TEXT[], -- Array of educational standards
  learning_objectives TEXT[] NOT NULL,
  duration_weeks INTEGER,
  prerequisites TEXT[],
  resources TEXT[], -- Array of resource URLs or descriptions
  assessment_methods TEXT[],
  created_by BIGINT NOT NULL,
  school_id BIGINT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_curriculum_subject ON curriculum(subject);
CREATE INDEX idx_curriculum_grade_level ON curriculum(grade_level);
CREATE INDEX idx_curriculum_school ON curriculum(school_id);
CREATE INDEX idx_curriculum_published ON curriculum(is_published);
CREATE INDEX idx_curriculum_active ON curriculum(is_active);
