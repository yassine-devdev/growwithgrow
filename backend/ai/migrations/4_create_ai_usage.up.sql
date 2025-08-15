CREATE TABLE ai_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('openrouter', 'ollama')),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  cost DOUBLE PRECISION DEFAULT 0,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('chat', 'completion', 'embedding')),
  school_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user ON ai_usage(user_id);
CREATE INDEX idx_ai_usage_model ON ai_usage(model_name);
CREATE INDEX idx_ai_usage_provider ON ai_usage(provider);
CREATE INDEX idx_ai_usage_school ON ai_usage(school_id);
CREATE INDEX idx_ai_usage_created_at ON ai_usage(created_at);
