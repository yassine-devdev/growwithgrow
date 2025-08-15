CREATE TABLE user_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id BIGINT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  events INTEGER DEFAULT 0,
  bounce BOOLEAN DEFAULT FALSE,
  entry_page TEXT,
  exit_page TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser VARCHAR(50),
  os VARCHAR(50),
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_school ON user_sessions(school_id);
CREATE INDEX idx_user_sessions_start_time ON user_sessions(start_time);
CREATE INDEX idx_user_sessions_device_type ON user_sessions(device_type);
