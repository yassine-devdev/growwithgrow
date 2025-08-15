CREATE TABLE enrollments (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL,
  class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'completed', 'withdrawn')),
  final_grade VARCHAR(5),
  grade_points DOUBLE PRECISION,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_class ON enrollments(class_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_active ON enrollments(is_active);
