import { api } from "encore.dev/api";
import { settingsDB } from "./db";
import type { UserSetting } from "./types";

export interface GetUserSettingsRequest {
  userId: number;
  key?: string;
}

export interface GetUserSettingsResponse {
  settings: UserSetting[];
}

// Retrieves user settings.
export const getUserSettings = api<GetUserSettingsRequest, GetUserSettingsResponse>(
  { expose: true, method: "GET", path: "/settings/user" },
  async (req) => {
    let whereClause = "WHERE user_id = $1";
    const params: any[] = [req.userId];
    let paramIndex = 2;

    if (req.key) {
      whereClause += ` AND key = $${paramIndex}`;
      params.push(req.key);
      paramIndex++;
    }

    const query = `
      SELECT 
        id,
        user_id as "userId",
        key,
        value,
        value_type as "valueType",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_settings
      ${whereClause}
      ORDER BY key
    `;

    const settings = await settingsDB.queryAll<UserSetting>(query, ...params);

    return { settings };
  }
);
