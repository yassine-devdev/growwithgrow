import { api } from "encore.dev/api";
import { knowledgeDB } from "./db";
import type { Curriculum } from "./types";

export interface CreateCurriculumRequest {
  name: string;
  description?: string;
  subject: string;
  gradeLevel: string;
  standards?: string[];
  learningObjectives: string[];
  durationWeeks?: number;
  prerequisites?: string[];
  resources?: string[];
  assessmentMethods?: string[];
  createdBy: number;
  schoolId?: number;
  isPublished?: boolean;
}

// Creates a new curriculum.
export const createCurriculum = api<CreateCurriculumRequest, Curriculum>(
  { expose: true, method: "POST", path: "/knowledge/curriculum" },
  async (req) => {
    const curriculum = await knowledgeDB.queryRow<Curriculum>`
      INSERT INTO curriculum (
        name, description, subject, grade_level, standards, learning_objectives,
        duration_weeks, prerequisites, resources, assessment_methods,
        created_by, school_id, is_published
      )
      VALUES (
        ${req.name}, ${req.description}, ${req.subject}, ${req.gradeLevel},
        ${req.standards}, ${req.learningObjectives}, ${req.durationWeeks},
        ${req.prerequisites}, ${req.resources}, ${req.assessmentMethods},
        ${req.createdBy}, ${req.schoolId}, ${req.isPublished || false}
      )
      RETURNING 
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
    `;

    return curriculum!;
  }
);
