import { api } from "encore.dev/api";
import { gamificationDB } from "./db";
import type { Quest } from "./types";

export interface CreateQuestRequest {
  name: string;
  description?: string;
  instructions?: string;
  questType: 'daily' | 'weekly' | 'monthly' | 'special' | 'story';
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  pointsReward: number;
  requirements: any;
  startDate?: Date;
  endDate?: Date;
  maxParticipants?: number;
  schoolId?: number;
  classId?: number;
  gradeLevel?: string;
  createdBy: number;
}

// Creates a new quest.
export const createQuest = api<CreateQuestRequest, Quest>(
  { expose: true, method: "POST", path: "/gamification/quests" },
  async (req) => {
    const quest = await gamificationDB.queryRow<Quest>`
      INSERT INTO quests (
        name, description, instructions, quest_type, difficulty, points_reward,
        requirements, start_date, end_date, max_participants, school_id,
        class_id, grade_level, created_by
      )
      VALUES (
        ${req.name}, ${req.description}, ${req.instructions}, ${req.questType},
        ${req.difficulty}, ${req.pointsReward}, ${req.requirements}, ${req.startDate},
        ${req.endDate}, ${req.maxParticipants}, ${req.schoolId}, ${req.classId},
        ${req.gradeLevel}, ${req.createdBy}
      )
      RETURNING 
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
    `;

    return quest!;
  }
);
