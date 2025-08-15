import { api } from "encore.dev/api";
import { knowledgeDB } from "./db";
import type { Curriculum } from "./types";

export interface ListCurriculumRequest {
  subject?: string;
  gradeLevel?: string;
  schoolId?: number;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListCurriculumResponse {
  curriculum: Curriculum[];
  total: number;
}

// Retrieves a list of curriculum items.
export const listCurriculum = api<ListCurriculumRequest, ListCurriculumResponse>(
  { expose: true, method: "GET", path: "/knowledge/curriculum" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

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
      FROM curriculum
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        description,
        subject,
        grade_level as "gradeLevel",
        standards,
        learning_objectives as "learningObjectives",
        duration_weeks as "durationWeeks",
        prerequisites,
        resources,
        assessment_methods as "assessmentMethods",
        created_by as "createdBy",
        school_id as "schoolId",
        is_published as "isPublished",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM curriculum
      ${whereClause}
      ORDER BY subject, grade_level, name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await knowledgeDB.queryRow<{ total: number }>(countQuery, ...params);
    const curriculum = await knowledgeDB.queryAll<Curriculum>(dataQuery, ...params, limit, offset);

    return {
      curriculum,
      total: countResult?.total || 0
    };
  }
);
