CREATE TABLE courses (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL DEFAULT 1,
  grade_level VARCHAR(10),
  subject VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  prerequisites TEXT[],
  syllabus_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_school ON courses(school_id);
CREATE INDEX idx_courses_subject ON courses(subject);
CREATE INDEX idx_courses_grade_level ON courses(grade_level);
CREATE INDEX idx_courses_active ON courses(is_active);
