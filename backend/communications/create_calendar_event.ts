import { api } from "encore.dev/api";
import { communicationsDB } from "./db";
import type { CalendarEvent } from "./types";

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  eventType: 'meeting' | 'class' | 'exam' | 'event' | 'holiday' | 'deadline';
  recurrenceRule?: string;
  attendeeIds?: number[];
  organizerId: number;
  schoolId?: number;
  classId?: number;
  isAllDay?: boolean;
  reminderMinutes?: number[];
  status?: 'tentative' | 'confirmed' | 'cancelled';
  visibility?: 'public' | 'private' | 'confidential';
}

// Creates a new calendar event.
export const createCalendarEvent = api<CreateCalendarEventRequest, CalendarEvent>(
  { expose: true, method: "POST", path: "/communications/calendar/events" },
  async (req) => {
    const event = await communicationsDB.queryRow<CalendarEvent>`
      INSERT INTO calendar_events (
        title, description, start_time, end_time, location, event_type,
        recurrence_rule, attendee_ids, organizer_id, school_id, class_id,
        is_all_day, reminder_minutes, status, visibility
      )
      VALUES (
        ${req.title}, ${req.description}, ${req.startTime}, ${req.endTime},
        ${req.location}, ${req.eventType}, ${req.recurrenceRule}, ${req.attendeeIds},
        ${req.organizerId}, ${req.schoolId}, ${req.classId}, ${req.isAllDay || false},
        ${req.reminderMinutes}, ${req.status || 'confirmed'}, ${req.visibility || 'public'}
      )
      RETURNING 
        id,
        title,
        description,
        start_time as "startTime",
        end_time as "endTime",
        location,
        event_type as "eventType",
        recurrence_rule as "recurrenceRule",
        attendee_ids as "attendeeIds",
        organizer_id as "organizerId",
        school_id as "schoolId",
        class_id as "classId",
        is_all_day as "isAllDay",
        reminder_minutes as "reminderMinutes",
        status,
        visibility,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return event!;
  }
);
