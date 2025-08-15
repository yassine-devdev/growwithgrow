import { api } from "encore.dev/api";
import { gamificationDB } from "./db";
import type { Quest } from "./types";

export interface ListQuestsRequest {
  questType?: string;
  difficulty?: string;
  schoolId?: number;
  classId?: number;
  gradeLevel?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListQuestsResponse {
  quests: Quest[];
  total: number;
}

// Retrieves a list of quests.
export const listQuests = api<ListQuestsRequest, ListQuestsResponse>(
  { expose: true, method: "GET", path: "/gamification/quests" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.isActive !== undefined) {
      whereClause += ` AND is_active = $${paramIndex}`;
      params.push(req.isActive);
      paramIndex++;
    } else {
      whereClause += ` AND is_active = TRUE`;
    }

    if (req.questType) {
      whereClause += ` AND quest_type = $${paramIndex}`;
      params.push(req.questType);
      paramIndex++;
    }

    if (req.difficulty) {
      whereClause += ` AND difficulty = $${paramIndex}`;
      params.push(req.difficulty);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND (school_id = $${paramIndex} OR school_id IS NULL)`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.classId) {
      whereClause += ` AND (class_id = $${paramIndex} OR class_id IS NULL)`;
      params.push(req.classId);
      paramIndex++;
    }

    if (req.gradeLevel) {
      whereClause += ` AND (grade_level = $${paramIndex} OR grade_level IS NULL)`;
      params.push(req.gradeLevel);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM quests
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        description,
        instructions,
        quest_type as "questType",
        difficulty,
        points_reward as "pointsReward",
        requirements,
        start_date as "startDate",
        end_date as "endDate",
        max_participants as "maxParticipants",
        current_participants as "currentParticipants",
        school_id as "schoolId",
        class_id as "classId",
        grade_level as "gradeLevel",
        is_active as "isActive",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM quests
      ${whereClause}
      ORDER BY end_date, start_date
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await gamificationDB.queryRow<{ total: number }>(countQuery, ...params);
    const quests = await gamificationDB.queryAll<Quest>(dataQuery, ...params, limit, offset);

    return {
      quests,
      total: countResult?.total || 0
    };
  }
);
