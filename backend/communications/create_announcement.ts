import { api } from "encore.dev/api";
import { communicationsDB } from "./db";
import type { Announcement } from "./types";

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  announcementType: 'general' | 'urgent' | 'academic' | 'event' | 'system';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
  schoolId?: number;
  gradeLevels?: string[];
  classIds?: number[];
  publishedAt?: Date;
  expiresAt?: Date;
  createdBy: number;
  isPublished?: boolean;
}

// Creates a new announcement.
export const createAnnouncement = api<CreateAnnouncementRequest, Announcement>(
  { expose: true, method: "POST", path: "/communications/announcements" },
  async (req) => {
    const announcement = await communicationsDB.queryRow<Announcement>`
      INSERT INTO announcements (
        title, content, announcement_type, priority, target_audience,
        school_id, grade_levels, class_ids, published_at, expires_at,
        created_by, is_published
      )
      VALUES (
        ${req.title}, ${req.content}, ${req.announcementType}, 
        ${req.priority || 'normal'}, ${req.targetAudience}, ${req.schoolId},
        ${req.gradeLevels}, ${req.classIds}, ${req.publishedAt}, ${req.expiresAt},
        ${req.createdBy}, ${req.isPublished || false}
      )
      RETURNING 
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
    `;

    return announcement!;
  }
);
