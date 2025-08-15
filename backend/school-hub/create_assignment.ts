import { api } from "encore.dev/api";
import { academicsDB } from "./db";
import type { Assignment } from "./types";

export interface CreateAssignmentRequest {
  classId: number;
  title: string;
  description?: string;
  assignmentType: 'homework' | 'quiz' | 'exam' | 'project' | 'essay' | 'lab';
  totalPoints: number;
  dueDate?: Date;
  instructions?: string;
  attachments?: string[];
  isPublished?: boolean;
}

// Creates a new assignment.
export const createAssignment = api<CreateAssignmentRequest, Assignment>(
  { expose: true, method: "POST", path: "/assignments" },
  async (req) => {
    const assignment = await academicsDB.queryRow<Assignment>`
      INSERT INTO assignments (
        class_id, title, description, assignment_type, total_points,
        due_date, instructions, attachments, is_published
      )
      VALUES (
        ${req.classId}, ${req.title}, ${req.description}, ${req.assignmentType},
        ${req.totalPoints}, ${req.dueDate}, ${req.instructions}, ${req.attachments},
        ${req.isPublished || false}
      )
      RETURNING 
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
    `;

    return assignment!;
  }
);
