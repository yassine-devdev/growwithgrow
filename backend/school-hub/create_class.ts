import { api } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Class } from "./types";

export interface CreateClassRequest {
  courseId: number;
  teacherId: number;
  section: string;
  roomNumber?: string;
  schedule?: any;
  maxStudents: number;
  semester: string;
  academicYear: string;
}

// Creates a new class.
export const createClass = api<CreateClassRequest, Class>(
  { expose: true, method: "POST", path: "/classes" },
  async (req) => {
    const classRecord = await academicsDB.queryRow<Class>`
      INSERT INTO classes (
        course_id, teacher_id, section, room_number, schedule,
        max_students, semester, academic_year
      )
      VALUES (
        ${req.courseId}, ${req.teacherId}, ${req.section}, ${req.roomNumber},
        ${req.schedule}, ${req.maxStudents}, ${req.semester}, ${req.academicYear}
      )
      RETURNING 
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
    `;

    return classRecord!;
  }
);
