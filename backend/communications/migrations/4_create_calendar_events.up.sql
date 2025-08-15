CREATE TABLE calendar_events (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('meeting', 'class', 'exam', 'event', 'holiday', 'deadline')),
  recurrence_rule TEXT, -- RRULE for recurring events
  attendee_ids BIGINT[], -- Array of user IDs
  organizer_id BIGINT NOT NULL,
  school_id BIGINT,
  class_id BIGINT,
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_minutes INTEGER[], -- Array of reminder times in minutes
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('tentative', 'confirmed', 'cancelled')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'confidential')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_end_time ON calendar_events(end_time);
CREATE INDEX idx_calendar_events_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_organizer ON calendar_events(organizer_id);
CREATE INDEX idx_calendar_events_school ON calendar_events(school_id);
CREATE INDEX idx_calendar_events_class ON calendar_events(class_id);
CREATE INDEX idx_calendar_events_attendees ON calendar_events USING GIN(attendee_ids);
