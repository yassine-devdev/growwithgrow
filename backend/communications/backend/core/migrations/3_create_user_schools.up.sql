CREATE TABLE user_schools (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  role_in_school VARCHAR(50) NOT NULL CHECK (role_in_school IN ('admin', 'teacher', 'student', 'parent')),
  grade_level VARCHAR(10), -- For students
  class_section VARCHAR(10), -- For students
  subject_specialization TEXT[], -- For teachers
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, school_id)
);

CREATE INDEX idx_user_schools_user ON user_schools(user_id);
CREATE INDEX idx_user_schools_school ON user_schools(school_id);
CREATE INDEX idx_user_schools_role ON user_schools(role_in_school);
