import { api } from "encore.dev/api";
import { communicationsDB } from "./db";
import type { Announcement } from "./types";

export interface ListAnnouncementsRequest {
  schoolId?: number;
  announcementType?: string;
  targetAudience?: string;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListAnnouncementsResponse {
  announcements: Announcement[];
  total: number;
}

// Retrieves a list of announcements.
export const listAnnouncements = api<ListAnnouncementsRequest, ListAnnouncementsResponse>(
  { expose: true, method: "GET", path: "/communications/announcements" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.announcementType) {
      whereClause += ` AND announcement_type = $${paramIndex}`;
      params.push(req.announcementType);
      paramIndex++;
    }

    if (req.targetAudience) {
      whereClause += ` AND target_audience = $${paramIndex}`;
      params.push(req.targetAudience);
      paramIndex++;
    }

    if (req.isPublished !== undefined) {
      whereClause += ` AND is_published = $${paramIndex}`;
      params.push(req.isPublished);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM announcements
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        title,
        content,
        announcement_type as "announcementType",
        priority,
        target_audience as "targetAudience",
        school_id as "schoolId",
        grade_levels as "gradeLevels",
        class_ids as "classIds",
        published_at as "publishedAt",
        expires_at as "expiresAt",
        created_by as "createdBy",
        is_published as "isPublished",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM announcements
      ${whereClause}
      ORDER BY priority DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await communicationsDB.queryRow<{ total: number }>(countQuery, ...params);
    const announcements = await communicationsDB.queryAll<Announcement>(dataQuery, ...params, limit, offset);

    return {
      announcements,
      total: countResult?.total || 0
    };
  }
);
