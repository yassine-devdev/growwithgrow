import { api } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Course } from "./types";

export interface CreateCourseRequest {
  schoolId: number;
  name: string;
  code: string;
  description?: string;
  credits: number;
  gradeLevel?: string;
  subject: string;
  department?: string;
  prerequisites?: string[];
  syllabusUrl?: string;
}

// Creates a new course.
export const createCourse = api<CreateCourseRequest, Course>(
  { expose: true, method: "POST", path: "/courses" },
  async (req) => {
    const course = await academicsDB.queryRow<Course>`
      INSERT INTO courses (
        school_id, name, code, description, credits, grade_level,
        subject, department, prerequisites, syllabus_url
      )
      VALUES (
        ${req.schoolId}, ${req.name}, ${req.code}, ${req.description},
        ${req.credits}, ${req.gradeLevel}, ${req.subject}, ${req.department},
        ${req.prerequisites}, ${req.syllabusUrl}
      )
      RETURNING 
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
    `;

    return course!;
  }
);
