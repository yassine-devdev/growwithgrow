import { api } from "encore.dev/api";
import { knowledgeDB } from "./db";
import type { Question } from "./types";

export interface ListQuestionsRequest {
  assessmentId?: number;
  questionType?: string;
  difficulty?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface ListQuestionsResponse {
  questions: Question[];
  total: number;
}

// Retrieves a list of questions from the question bank.
export const listQuestions = api<ListQuestionsRequest, ListQuestionsResponse>(
  { expose: true, method: "GET", path: "/knowledge/questions" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.assessmentId) {
      whereClause += ` AND assessment_id = $${paramIndex}`;
      params.push(req.assessmentId);
      paramIndex++;
    }

    if (req.questionType) {
      whereClause += ` AND question_type = $${paramIndex}`;
      params.push(req.questionType);
      paramIndex++;
    }

    if (req.difficulty) {
      whereClause += ` AND difficulty = $${paramIndex}`;
      params.push(req.difficulty);
      paramIndex++;
    }

    if (req.tags && req.tags.length > 0) {
      whereClause += ` AND tags @> $${paramIndex}`;
      params.push(req.tags);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM questions
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
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
      FROM questions
      ${whereClause}
      ORDER BY order_index
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await knowledgeDB.queryRow<{ total: number }>(countQuery, ...params);
    const questions = await knowledgeDB.queryAll<Question>(dataQuery, ...params, limit, offset);

    return {
      questions,
      total: countResult?.total || 0
    };
  }
);
