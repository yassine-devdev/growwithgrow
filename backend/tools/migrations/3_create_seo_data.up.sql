CREATE TABLE seo_data (
  id BIGSERIAL PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  title VARCHAR(255),
  meta_description TEXT,
  keywords TEXT[],
  h1_tags TEXT[],
  h2_tags TEXT[],
  internal_links INTEGER DEFAULT 0,
  external_links INTEGER DEFAULT 0,
  images_count INTEGER DEFAULT 0,
  images_without_alt INTEGER DEFAULT 0,
  page_speed_score INTEGER,
  mobile_friendly BOOLEAN DEFAULT FALSE,
  ssl_enabled BOOLEAN DEFAULT FALSE,
  crawl_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seo_data_url ON seo_data(url);
CREATE INDEX idx_seo_data_school ON seo_data(school_id);
CREATE INDEX idx_seo_data_crawl_date ON seo_data(crawl_date);
