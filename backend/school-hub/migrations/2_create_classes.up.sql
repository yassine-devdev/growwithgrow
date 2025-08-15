CREATE TABLE classes (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id BIGINT NOT NULL,
  section VARCHAR(10) NOT NULL,
  room_number VARCHAR(20),
  schedule JSONB, -- Store class schedule as JSON
  max_students INTEGER NOT NULL DEFAULT 30,
  current_enrollment INTEGER NOT NULL DEFAULT 0,
  semester VARCHAR(20) NOT NULL,
  academic_year VARCHAR(10) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classes_course ON classes(course_id);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_semester ON classes(semester);
CREATE INDEX idx_classes_academic_year ON classes(academic_year);
CREATE INDEX idx_classes_active ON classes(is_active);
