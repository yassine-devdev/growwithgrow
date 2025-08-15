import { api } from "encore.dev/api";
import { knowledgeDB } from "./db";
import type { Assessment } from "./types";

export interface CreateAssessmentRequest {
  title: string;
  description?: string;
  assessmentType: 'quiz' | 'test' | 'exam' | 'project' | 'assignment' | 'survey';
  subject: string;
  gradeLevel?: string;
  durationMinutes?: number;
  totalPoints: number;
  passingScore?: number;
  instructions?: string;
  createdBy: number;
  schoolId?: number;
  isPublished?: boolean;
}

// Creates a new assessment.
export const createAssessment = api<CreateAssessmentRequest, Assessment>(
  { expose: true, method: "POST", path: "/knowledge/assessments" },
  async (req) => {
    const assessment = await knowledgeDB.queryRow<Assessment>`
      INSERT INTO assessments (
        title, description, assessment_type, subject, grade_level,
        duration_minutes, total_points, passing_score, instructions,
        created_by, school_id, is_published
      )
      VALUES (
        ${req.title}, ${req.description}, ${req.assessmentType}, ${req.subject},
        ${req.gradeLevel}, ${req.durationMinutes}, ${req.totalPoints},
        ${req.passingScore}, ${req.instructions}, ${req.createdBy},
        ${req.schoolId}, ${req.isPublished || false}
      )
      RETURNING 
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
    `;

    return assessment!;
  }
);
