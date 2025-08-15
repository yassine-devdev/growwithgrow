CREATE TABLE library_items (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('book', 'article', 'video', 'audio', 'document', 'image', 'link')),
  content_url TEXT,
  file_size BIGINT, -- File size in bytes
  duration_seconds INTEGER, -- For video/audio content
  author VARCHAR(255),
  publisher VARCHAR(255),
  publication_date DATE,
  isbn VARCHAR(20),
  subject VARCHAR(100),
  grade_level VARCHAR(10),
  language VARCHAR(50) DEFAULT 'en',
  tags TEXT[],
  access_level VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (access_level IN ('public', 'restricted', 'private')),
  download_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  rating DOUBLE PRECISION CHECK (rating >= 0 AND rating <= 5),
  created_by BIGINT NOT NULL,
  school_id BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_library_items_type ON library_items(item_type);
CREATE INDEX idx_library_items_subject ON library_items(subject);
CREATE INDEX idx_library_items_grade_level ON library_items(grade_level);
CREATE INDEX idx_library_items_author ON library_items(author);
CREATE INDEX idx_library_items_school ON library_items(school_id);
CREATE INDEX idx_library_items_access ON library_items(access_level);
CREATE INDEX idx_library_items_active ON library_items(is_active);
