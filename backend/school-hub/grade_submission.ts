import { api, APIError } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Submission } from "./types";

export interface GradeSubmissionRequest {
  submissionId: number;
  score: number;
  feedback?: string;
  gradedBy: number; // Teacher ID
}

// Grades an assignment submission.
export const gradeSubmission = api<GradeSubmissionRequest, Submission>(
  { expose: true, method: "PUT", path: "/academics/submissions/:submissionId/grade" },
  async (req) => {
    const submission = await academicsDB.queryRow<Submission>`
      UPDATE submissions
      SET 
        score = ${req.score},
        feedback = ${req.feedback},
        graded_by = ${req.gradedBy},
        status = 'graded',
        graded_at = NOW(),
        updated_at = NOW()
      WHERE id = ${req.submissionId}
      RETURNING 
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
    `;

    if (!submission) {
      throw APIError.notFound("Submission not found");
    }

    return submission;
  }
);
