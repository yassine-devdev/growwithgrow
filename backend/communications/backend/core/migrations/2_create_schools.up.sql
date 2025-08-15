CREATE TABLE schools (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  logo_url TEXT,
  established_year INTEGER,
  school_type VARCHAR(50) NOT NULL CHECK (school_type IN ('public', 'private', 'charter', 'international')),
  grade_levels TEXT[], -- Array of grade levels like ['K', '1', '2', '3']
  student_capacity INTEGER,
  current_enrollment INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schools_active ON schools(is_active);
CREATE INDEX idx_schools_type ON schools(school_type);
CREATE INDEX idx_schools_city ON schools(city);
