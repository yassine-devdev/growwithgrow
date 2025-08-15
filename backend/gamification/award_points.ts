import { api } from "encore.dev/api";
import { gamificationDB } from "./db";
import type { UserPoints } from "./types";

export interface AwardPointsRequest {
  userId: number;
  points: number;
  reason?: string;
  category?: string;
  referenceId?: number;
  referenceType?: string;
  schoolId?: number;
}

// Awards points to a user.
export const awardPoints = api<AwardPointsRequest, UserPoints>(
  { expose: true, method: "POST", path: "/gamification/points" },
  async (req) => {
    const userPoints = await gamificationDB.queryRow<UserPoints>`
      INSERT INTO user_points (
        user_id, points, reason, category, reference_id, reference_type, school_id
      )
      VALUES (
        ${req.userId}, ${req.points}, ${req.reason}, ${req.category},
        ${req.referenceId}, ${req.referenceType}, ${req.schoolId}
      )
      RETURNING 
        id,
        user_id as "userId",
        points,
        reason,
        category,
        reference_id as "referenceId",
        reference_type as "referenceType",
        school_id as "schoolId",
        awarded_at as "awardedAt"
    `;

    // Check for achievement unlocks
    await checkAchievements(req.userId, req.schoolId);

    return userPoints!;
  }
);

async function checkAchievements(userId: number, schoolId?: number): Promise<void> {
  // Get user's total points
  const totalPoints = await gamificationDB.queryRow<{ total: number }>`
    SELECT COALESCE(SUM(points), 0) as total
    FROM user_points
    WHERE user_id = ${userId}
  `;

  // Check point-based achievements
  const pointAchievements = await gamificationDB.queryAll<{ id: number; criteria: any }>`
    SELECT id, criteria
    FROM achievements
    WHERE is_active = TRUE
    AND (school_id = ${schoolId} OR school_id IS NULL)
    AND JSON_EXTRACT_PATH_TEXT(criteria, 'type') = 'points'
    AND id NOT IN (
      SELECT achievement_id 
      FROM user_achievements 
      WHERE user_id = ${userId}
    )
  `;

  for (const achievement of pointAchievements) {
    const requiredPoints = achievement.criteria.points || 0;
    if (totalPoints!.total >= requiredPoints) {
      await gamificationDB.exec`
        INSERT INTO user_achievements (user_id, achievement_id)
        VALUES (${userId}, ${achievement.id})
        ON CONFLICT (user_id, achievement_id) DO NOTHING
      `;
    }
  }
}
