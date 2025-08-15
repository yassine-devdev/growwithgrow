CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  announcement_type VARCHAR(50) NOT NULL CHECK (announcement_type IN ('general', 'urgent', 'academic', 'event', 'system')),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_audience VARCHAR(50) NOT NULL CHECK (target_audience IN ('all', 'students', 'teachers', 'parents', 'staff')),
  school_id BIGINT,
  grade_levels TEXT[], -- Array of grade levels
  class_ids BIGINT[], -- Array of class IDs
  published_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by BIGINT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_type ON announcements(announcement_type);
CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_audience ON announcements(target_audience);
CREATE INDEX idx_announcements_school ON announcements(school_id);
CREATE INDEX idx_announcements_published ON announcements(is_published);
CREATE INDEX idx_announcements_published_at ON announcements(published_at);
