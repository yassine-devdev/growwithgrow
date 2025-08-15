CREATE TABLE store_items (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('book', 'course', 'exam', 'bundle', 'subscription')),
  price DOUBLE PRECISION NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  category VARCHAR(100),
  subject VARCHAR(100),
  grade_level VARCHAR(10),
  author VARCHAR(255),
  publisher VARCHAR(255),
  isbn VARCHAR(20),
  preview_url TEXT,
  content_url TEXT,
  file_size BIGINT,
  duration_hours DOUBLE PRECISION, -- For courses
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  prerequisites TEXT[],
  learning_outcomes TEXT[],
  tags TEXT[],
  rating DOUBLE PRECISION CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_store_items_type ON store_items(item_type);
CREATE INDEX idx_store_items_category ON store_items(category);
CREATE INDEX idx_store_items_subject ON store_items(subject);
CREATE INDEX idx_store_items_grade_level ON store_items(grade_level);
CREATE INDEX idx_store_items_price ON store_items(price);
CREATE INDEX idx_store_items_rating ON store_items(rating);
CREATE INDEX idx_store_items_featured ON store_items(is_featured);
CREATE INDEX idx_store_items_available ON store_items(is_available);
