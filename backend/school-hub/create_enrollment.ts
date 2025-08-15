import { api, APIError } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Enrollment } from "./types";

export interface CreateEnrollmentRequest {
  studentId: number;
  classId: number;
}

// Enrolls a student in a class.
export const createEnrollment = api<CreateEnrollmentRequest, Enrollment>(
  { expose: true, method: "POST", path: "/academics/enrollments" },
  async (req) => {
    // Check for existing enrollment
    const existing = await academicsDB.queryRow`
      SELECT id FROM enrollments 
      WHERE student_id = ${req.studentId} AND class_id = ${req.classId} AND is_active = TRUE
    `;
    if (existing) {
      throw APIError.alreadyExists("Student is already enrolled in this class");
    }

    // Check class capacity
    const classInfo = await academicsDB.queryRow<{ max_students: number; current_enrollment: number }>`
      SELECT max_students, current_enrollment FROM classes WHERE id = ${req.classId}
    `;
    if (!classInfo) {
      throw APIError.notFound("Class not found");
    }
    if (classInfo.current_enrollment >= classInfo.max_students) {
      throw APIError.resourceExhausted("Class is full");
    }

    // Create enrollment and update class enrollment count in a transaction
    await using tx = await academicsDB.begin();
    const enrollment = await tx.queryRow<Enrollment>`
      INSERT INTO enrollments (student_id, class_id)
      VALUES (${req.studentId}, ${req.classId})
      RETURNING 
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
    `;
    await tx.exec`
      UPDATE classes SET current_enrollment = current_enrollment + 1 WHERE id = ${req.classId}
    `;
    
    return enrollment!;
  }
);
