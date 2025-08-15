CREATE TABLE conversations (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(255),
  context_type VARCHAR(50) NOT NULL CHECK (context_type IN ('general', 'academic', 'administrative', 'support')),
  school_id BIGINT,
  class_id BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_context ON conversations(context_type);
CREATE INDEX idx_conversations_school ON conversations(school_id);
CREATE INDEX idx_conversations_class ON conversations(class_id);
CREATE INDEX idx_conversations_active ON conversations(is_active);
