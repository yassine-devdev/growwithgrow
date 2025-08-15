import { api } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Class } from "./types";

export interface ListClassesRequest {
  courseId?: number;
  teacherId?: number;
  semester?: string;
  academicYear?: string;
  limit?: number;
  offset?: number;
}

export interface ListClassesResponse {
  classes: Class[];
  total: number;
}

// Retrieves a list of classes with optional filtering.
export const listClasses = api<ListClassesRequest, ListClassesResponse>(
  { expose: true, method: "GET", path: "/classes" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.courseId) {
      whereClause += ` AND course_id = $${paramIndex}`;
      params.push(req.courseId);
      paramIndex++;
    }

    if (req.teacherId) {
      whereClause += ` AND teacher_id = $${paramIndex}`;
      params.push(req.teacherId);
      paramIndex++;
    }

    if (req.semester) {
      whereClause += ` AND semester = $${paramIndex}`;
      params.push(req.semester);
      paramIndex++;
    }

    if (req.academicYear) {
      whereClause += ` AND academic_year = $${paramIndex}`;
      params.push(req.academicYear);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM classes
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        course_id as "courseId",
        teacher_id as "teacherId",
        section,
        room_number as "roomNumber",
        schedule,
        max_students as "maxStudents",
        current_enrollment as "currentEnrollment",
        semester,
        academic_year as "academicYear",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM classes
      ${whereClause}
      ORDER BY semester DESC, section
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await academicsDB.queryRow<{ total: number }>(countQuery, ...params);
    const classes = await academicsDB.queryAll<Class>(dataQuery, ...params, limit, offset);

    return {
      classes,
      total: countResult?.total || 0
    };
  }
);
