import { api } from "encore.dev/api";
import { knowledgeDB } from "./db";
import type { Question } from "./types";

export interface CreateQuestionRequest {
  assessmentId?: number;
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank' | 'matching';
  options?: any;
  correctAnswer?: string;
  points?: number;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  orderIndex?: number;
}

// Creates a new question for the question bank.
export const createQuestion = api<CreateQuestionRequest, Question>(
  { expose: true, method: "POST", path: "/knowledge/questions" },
  async (req) => {
    const question = await knowledgeDB.queryRow<Question>`
      INSERT INTO questions (
        assessment_id, question_text, question_type, options, correct_answer,
        points, explanation, difficulty, tags, order_index
      )
      VALUES (
        ${req.assessmentId}, ${req.questionText}, ${req.questionType}, ${req.options},
        ${req.correctAnswer}, ${req.points || 1}, ${req.explanation},
        ${req.difficulty}, ${req.tags}, ${req.orderIndex || 0}
      )
      RETURNING 
        id,
        assessment_id as "assessmentId",
        question_text as "questionText",
        question_type as "questionType",
        options,
        correct_answer as "correctAnswer",
        points,
        explanation,
        difficulty,
        tags,
        order_index as "orderIndex",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return question!;
  }
);
