CREATE TABLE user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  key VARCHAR(255) NOT NULL,
  value TEXT,
  value_type VARCHAR(20) NOT NULL DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, key)
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE INDEX idx_user_settings_key ON user_settings(key);
