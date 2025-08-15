import { api } from "encore.dev/api";
import { analyticsDB } from "./db";
import type { Event } from "./types";

export interface TrackEventRequest {
  userId?: number;
  sessionId?: string;
  eventName: string;
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  properties?: any;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  schoolId?: number;
}

// Tracks an analytics event.
export const trackEvent = api<TrackEventRequest, Event>(
  { expose: true, method: "POST", path: "/analytics/events" },
  async (req) => {
    const event = await analyticsDB.queryRow<Event>`
      INSERT INTO events (
        user_id, session_id, event_name, event_category, event_action,
        event_label, event_value, properties, page_url, page_title,
        referrer, user_agent, ip_address, country, city, device_type,
        browser, os, school_id
      )
      VALUES (
        ${req.userId}, ${req.sessionId}, ${req.eventName}, ${req.eventCategory},
        ${req.eventAction}, ${req.eventLabel}, ${req.eventValue}, ${req.properties},
        ${req.pageUrl}, ${req.pageTitle}, ${req.referrer}, ${req.userAgent},
        ${req.ipAddress}, ${req.country}, ${req.city}, ${req.deviceType},
        ${req.browser}, ${req.os}, ${req.schoolId}
      )
      RETURNING 
        id,
        user_id as "userId",
        session_id as "sessionId",
        event_name as "eventName",
        event_category as "eventCategory",
        event_action as "eventAction",
        event_label as "eventLabel",
        event_value as "eventValue",
        properties,
        page_url as "pageUrl",
        page_title as "pageTitle",
        referrer,
        user_agent as "userAgent",
        ip_address as "ipAddress",
        country,
        city,
        device_type as "deviceType",
        browser,
        os,
        school_id as "schoolId",
        created_at as "createdAt"
    `;

    return event!;
  }
);
