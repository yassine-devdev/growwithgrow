import { api } from "encore.dev/api";
import { communicationsDB } from "./db";
import type { CalendarEvent } from "./types";

export interface ListCalendarEventsRequest {
  userId?: number;
  schoolId?: number;
  classId?: number;
  eventType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ListCalendarEventsResponse {
  events: CalendarEvent[];
  total: number;
}

// Retrieves a list of calendar events.
export const listCalendarEvents = api<ListCalendarEventsRequest, ListCalendarEventsResponse>(
  { expose: true, method: "GET", path: "/communications/calendar/events" },
  async (req) => {
    const limit = req.limit || 100;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE status != 'cancelled'";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.userId) {
      whereClause += ` AND (organizer_id = $${paramIndex} OR $${paramIndex + 1} = ANY(attendee_ids))`;
      params.push(req.userId, req.userId);
      paramIndex += 2;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.classId) {
      whereClause += ` AND class_id = $${paramIndex}`;
      params.push(req.classId);
      paramIndex++;
    }

    if (req.eventType) {
      whereClause += ` AND event_type = $${paramIndex}`;
      params.push(req.eventType);
      paramIndex++;
    }

    if (req.startDate) {
      whereClause += ` AND end_time >= $${paramIndex}`;
      params.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      whereClause += ` AND start_time <= $${paramIndex}`;
      params.push(req.endDate);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM calendar_events
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
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
      FROM calendar_events
      ${whereClause}
      ORDER BY start_time ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await communicationsDB.queryRow<{ total: number }>(countQuery, ...params);
    const events = await communicationsDB.queryAll<CalendarEvent>(dataQuery, ...params, limit, offset);

    return {
      events,
      total: countResult?.total || 0
    };
  }
);
