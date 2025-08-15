CREATE TABLE emails (
  id BIGSERIAL PRIMARY KEY,
  sender_id BIGINT NOT NULL,
  recipient_ids BIGINT[] NOT NULL,
  cc_ids BIGINT[],
  bcc_ids BIGINT[],
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  attachments TEXT[], -- Array of file URLs
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  thread_id BIGINT,
  reply_to_id BIGINT REFERENCES emails(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emails_sender ON emails(sender_id);
CREATE INDEX idx_emails_recipients ON emails USING GIN(recipient_ids);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_thread ON emails(thread_id);
CREATE INDEX idx_emails_sent_at ON emails(sent_at);
