import { api } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Enrollment } from "./types";

export interface ListEnrollmentsRequest {
  studentId?: number;
  classId?: number;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ListEnrollmentsResponse {
  enrollments: Enrollment[];
  total: number;
}

// Retrieves a list of enrollments.
export const listEnrollments = api<ListEnrollmentsRequest, ListEnrollmentsResponse>(
  { expose: true, method: "GET", path: "/academics/enrollments" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.studentId) {
      whereClause += ` AND student_id = $${paramIndex}`;
      params.push(req.studentId);
      paramIndex++;
    }

    if (req.classId) {
      whereClause += ` AND class_id = $${paramIndex}`;
      params.push(req.classId);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM enrollments
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        student_id as "studentId",
        class_id as "classId",
        enrollment_date as "enrollmentDate",
        status,
        final_grade as "finalGrade",
        grade_points as "gradePoints",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM enrollments
      ${whereClause}
      ORDER BY enrollment_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await academicsDB.queryRow<{ total: number }>(countQuery, ...params);
    const enrollments = await academicsDB.queryAll<Enrollment>(dataQuery, ...params, limit, offset);

    return {
      enrollments,
      total: countResult?.total || 0
    };
  }
);
