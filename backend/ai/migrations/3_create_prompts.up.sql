CREATE TABLE prompts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  variables TEXT[], -- Array of variable names that can be substituted
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_system ON prompts(is_system);
CREATE INDEX idx_prompts_active ON prompts(is_active);
CREATE INDEX idx_prompts_created_by ON prompts(created_by);
