import { api, APIError } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Submission } from "./types";

export interface CreateSubmissionRequest {
  assignmentId: number;
  studentId: number;
  content?: string;
  attachments?: string[];
}

// Creates a new assignment submission.
export const createSubmission = api<CreateSubmissionRequest, Submission>(
  { expose: true, method: "POST", path: "/academics/submissions" },
  async (req) => {
    const existing = await academicsDB.queryRow`
      SELECT id FROM submissions
      WHERE assignment_id = ${req.assignmentId} AND student_id = ${req.studentId}
    `;
    if (existing) {
      throw APIError.alreadyExists("Submission for this assignment already exists.");
    }

    const assignment = await academicsDB.queryRow<{ due_date: Date }>`
      SELECT due_date FROM assignments WHERE id = ${req.assignmentId}
    `;
    if (!assignment) {
      throw APIError.notFound("Assignment not found");
    }

    const isLate = assignment.due_date ? new Date() > assignment.due_date : false;

    const submission = await academicsDB.queryRow<Submission>`
      INSERT INTO submissions (
        assignment_id, student_id, content, attachments, is_late
      )
      VALUES (
        ${req.assignmentId}, ${req.studentId}, ${req.content}, ${req.attachments}, ${isLate}
      )
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

    return submission!;
  }
);
