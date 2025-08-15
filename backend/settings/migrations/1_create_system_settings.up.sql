CREATE TABLE system_settings (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  value_type VARCHAR(20) NOT NULL DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  category VARCHAR(100) NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  is_editable BOOLEAN NOT NULL DEFAULT TRUE,
  school_id BIGINT, -- NULL for global settings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_school ON system_settings(school_id);
CREATE INDEX idx_system_settings_public ON system_settings(is_public);
