import { api } from "encore.dev/api";
import { analyticsDB } from "./db";
import type { PageView } from "./types";

export interface TrackPageViewRequest {
  userId?: number;
  sessionId: string;
  pageUrl: string;
  pageTitle?: string;
  referrer?: string;
  durationSeconds?: number;
  bounce?: boolean;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  schoolId?: number;
}

// Tracks a page view.
export const trackPageView = api<TrackPageViewRequest, PageView>(
  { expose: true, method: "POST", path: "/analytics/page-views" },
  async (req) => {
    const pageView = await analyticsDB.queryRow<PageView>`
      INSERT INTO page_views (
        user_id, session_id, page_url, page_title, referrer,
        duration_seconds, bounce, user_agent, ip_address, country,
        city, device_type, browser, os, school_id
      )
      VALUES (
        ${req.userId}, ${req.sessionId}, ${req.pageUrl}, ${req.pageTitle},
        ${req.referrer}, ${req.durationSeconds}, ${req.bounce || false},
        ${req.userAgent}, ${req.ipAddress}, ${req.country}, ${req.city},
        ${req.deviceType}, ${req.browser}, ${req.os}, ${req.schoolId}
      )
      RETURNING 
        id,
        user_id as "userId",
        session_id as "sessionId",
        page_url as "pageUrl",
        page_title as "pageTitle",
        referrer,
        duration_seconds as "durationSeconds",
        bounce,
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

    // Update session page views count
    await analyticsDB.exec`
      UPDATE user_sessions 
      SET page_views = page_views + 1, updated_at = NOW()
      WHERE session_id = ${req.sessionId}
    `;

    return pageView!;
  }
);
