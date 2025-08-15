import { api } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Assignment } from "./types";

export interface ListAssignmentsRequest {
  classId?: number;
  assignmentType?: string;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListAssignmentsResponse {
  assignments: Assignment[];
  total: number;
}

// Retrieves a list of assignments with optional filtering.
export const listAssignments = api<ListAssignmentsRequest, ListAssignmentsResponse>(
  { expose: true, method: "GET", path: "/assignments" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.classId) {
      whereClause += ` AND class_id = $${paramIndex}`;
      params.push(req.classId);
      paramIndex++;
    }

    if (req.assignmentType) {
      whereClause += ` AND assignment_type = $${paramIndex}`;
      params.push(req.assignmentType);
      paramIndex++;
    }

    if (req.isPublished !== undefined) {
      whereClause += ` AND is_published = $${paramIndex}`;
      params.push(req.isPublished);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM assignments
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        class_id as "classId",
        title,
        description,
        assignment_type as "assignmentType",
        total_points as "totalPoints",
        due_date as "dueDate",
        instructions,
        attachments,
        is_published as "isPublished",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM assignments
      ${whereClause}
      ORDER BY due_date ASC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await academicsDB.queryRow<{ total: number }>(countQuery, ...params);
    const assignments = await academicsDB.queryAll<Assignment>(dataQuery, ...params, limit, offset);

    return {
      assignments,
      total: countResult?.total || 0
    };
  }
);
