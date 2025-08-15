CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  session_id VARCHAR(255),
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  event_action VARCHAR(50) NOT NULL,
  event_label VARCHAR(100),
  event_value DOUBLE PRECISION,
  properties JSONB, -- Store event properties as JSON
  page_url TEXT,
  page_title VARCHAR(255),
  referrer TEXT,
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

CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_name ON events(event_name);
CREATE INDEX idx_events_category ON events(event_category);
CREATE INDEX idx_events_school ON events(school_id);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_device_type ON events(device_type);
