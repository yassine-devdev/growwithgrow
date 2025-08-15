import { api } from "encore.dev/api";
import { knowledgeDB } from "./db";
import type { Assessment } from "./types";

export interface ListAssessmentsRequest {
  assessmentType?: string;
  subject?: string;
  gradeLevel?: string;
  schoolId?: number;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListAssessmentsResponse {
  assessments: Assessment[];
  total: number;
}

// Retrieves a list of assessments.
export const listAssessments = api<ListAssessmentsRequest, ListAssessmentsResponse>(
  { expose: true, method: "GET", path: "/knowledge/assessments" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.assessmentType) {
      whereClause += ` AND assessment_type = $${paramIndex}`;
      params.push(req.assessmentType);
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

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.isPublished !== undefined) {
      whereClause += ` AND is_published = $${paramIndex}`;
      params.push(req.isPublished);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM assessments
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        title,
        description,
        assessment_type as "assessmentType",
        subject,
        grade_level as "gradeLevel",
        duration_minutes as "durationMinutes",
        total_points as "totalPoints",
        passing_score as "passingScore",
        instructions,
        created_by as "createdBy",
        school_id as "schoolId",
        is_published as "isPublished",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM assessments
      ${whereClause}
      ORDER BY subject, title
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await knowledgeDB.queryRow<{ total: number }>(countQuery, ...params);
    const assessments = await knowledgeDB.queryAll<Assessment>(dataQuery, ...params, limit, offset);

    return {
      assessments,
      total: countResult?.total || 0
    };
  }
);
