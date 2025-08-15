import { api } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Submission } from "./types";

export interface ListSubmissionsRequest {
  assignmentId?: number;
  studentId?: number;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ListSubmissionsResponse {
  submissions: Submission[];
  total: number;
}

// Retrieves a list of submissions.
export const listSubmissions = api<ListSubmissionsRequest, ListSubmissionsResponse>(
  { expose: true, method: "GET", path: "/academics/submissions" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.assignmentId) {
      whereClause += ` AND assignment_id = $${paramIndex}`;
      params.push(req.assignmentId);
      paramIndex++;
    }

    if (req.studentId) {
      whereClause += ` AND student_id = $${paramIndex}`;
      params.push(req.studentId);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM submissions
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        assignment_id as "assignmentId",
        student_id as "studentId",
        content,
        attachments,
        submitted_at as "submittedAt",
        status,
        score,
        feedback,
        graded_at as "gradedAt",
        graded_by as "gradedBy",
        is_late as "isLate",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM submissions
      ${whereClause}
      ORDER BY submitted_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await academicsDB.queryRow<{ total: number }>(countQuery, ...params);
    const submissions = await academicsDB.queryAll<Submission>(dataQuery, ...params, limit, offset);

    return {
      submissions,
      total: countResult?.total || 0
    };
  }
);
