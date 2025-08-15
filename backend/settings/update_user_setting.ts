import { api } from "encore.dev/api";
import { settingsDB } from "./db";
import type { UserSetting } from "./types";

export interface UpdateUserSettingRequest {
  userId: number;
  key: string;
  value: string;
  valueType?: 'string' | 'number' | 'boolean' | 'json';
}

// Updates a user setting.
export const updateUserSetting = api<UpdateUserSettingRequest, UserSetting>(
  { expose: true, method: "PUT", path: "/settings/user/:key" },
  async (req) => {
    const setting = await settingsDB.queryRow<UserSetting>`
      INSERT INTO user_settings (user_id, key, value, value_type)
      VALUES (${req.userId}, ${req.key}, ${req.value}, ${req.valueType || 'string'})
      ON CONFLICT (user_id, key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        value_type = EXCLUDED.value_type,
        updated_at = NOW()
      RETURNING 
        id,
        user_id as "userId",
        key,
        value,
        value_type as "valueType",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return setting!;
  }
);
