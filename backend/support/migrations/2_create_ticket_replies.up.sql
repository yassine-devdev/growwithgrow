CREATE TABLE ticket_replies (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[],
  is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id);
CREATE INDEX idx_ticket_replies_user ON ticket_replies(user_id);
