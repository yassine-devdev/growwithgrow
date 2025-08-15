CREATE TABLE page_views (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  session_id VARCHAR(255) NOT NULL,
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  referrer TEXT,
  duration_seconds INTEGER, -- Time spent on page
  bounce BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser VARCHAR(50),
  os VARCHAR(50),
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_views_user ON page_views(user_id);
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_url ON page_views(page_url);
CREATE INDEX idx_page_views_school ON page_views(school_id);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_device_type ON page_views(device_type);
