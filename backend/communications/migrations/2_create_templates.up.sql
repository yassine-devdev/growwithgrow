CREATE TABLE email_templates (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('personal', 'public', 'system')),
  category VARCHAR(100),
  variables TEXT[], -- Array of variable names like ['firstName', 'schoolName']
  created_by BIGINT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_templates_type ON email_templates(template_type);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_created_by ON email_templates(created_by);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);
