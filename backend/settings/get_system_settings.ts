import { api } from "encore.dev/api";
import { settingsDB } from "./db";
import type { SystemSetting } from "./types";

export interface GetSystemSettingsRequest {
  category?: string;
  schoolId?: number;
  isPublic?: boolean;
}

export interface GetSystemSettingsResponse {
  settings: SystemSetting[];
}

// Retrieves system settings.
export const getSystemSettings = api<GetSystemSettingsRequest, GetSystemSettingsResponse>(
  { expose: true, method: "GET", path: "/settings/system" },
  async (req) => {
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(req.category);
      paramIndex++;
    }

    if (req.schoolId !== undefined) {
      whereClause += ` AND (school_id = $${paramIndex} OR school_id IS NULL)`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.isPublic !== undefined) {
      whereClause += ` AND is_public = $${paramIndex}`;
      params.push(req.isPublic);
      paramIndex++;
    }

    const query = `
      SELECT 
        id,
        key,
        value,
        value_type as "valueType",
        description,
        category,
        is_public as "isPublic",
        is_editable as "isEditable",
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM system_settings
      ${whereClause}
      ORDER BY category, key
    `;

    const settings = await settingsDB.queryAll<SystemSetting>(query, ...params);

    return { settings };
  }
);
