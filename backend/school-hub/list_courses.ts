import { api } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Course } from "./types";

export interface ListCoursesRequest {
  schoolId?: number;
  subject?: string;
  gradeLevel?: string;
  limit?: number;
  offset?: number;
}

export interface ListCoursesResponse {
  courses: Course[];
  total: number;
}

// Retrieves a list of courses with optional filtering.
export const listCourses = api<ListCoursesRequest, ListCoursesResponse>(
  { expose: true, method: "GET", path: "/courses" },
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

    if (req.subject) {
      whereClause += ` AND LOWER(subject) LIKE LOWER($${paramIndex})`;
      params.push(`%${req.subject}%`);
      paramIndex++;
    }

    if (req.gradeLevel) {
      whereClause += ` AND grade_level = $${paramIndex}`;
      params.push(req.gradeLevel);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        school_id as "schoolId",
        name,
        code,
        description,
        credits,
        grade_level as "gradeLevel",
        subject,
        department,
        prerequisites,
        syllabus_url as "syllabusUrl",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM courses
      ${whereClause}
      ORDER BY subject, name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await academicsDB.queryRow<{ total: number }>(countQuery, ...params);
    const courses = await academicsDB.queryAll<Course>(dataQuery, ...params, limit, offset);

    return {
      courses,
      total: countResult?.total || 0
    };
  }
);
