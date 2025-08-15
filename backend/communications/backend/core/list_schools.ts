import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { School } from "./types";

export interface ListSchoolsRequest {
  limit?: number;
  offset?: number;
  schoolType?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface ListSchoolsResponse {
  schools: School[];
  total: number;
}

// Retrieves a list of schools with optional filtering.
export const listSchools = api<ListSchoolsRequest, ListSchoolsResponse>(
  { expose: true, method: "GET", path: "/schools" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.schoolType) {
      whereClause += ` AND school_type = $${paramIndex}`;
      params.push(req.schoolType);
      paramIndex++;
    }

    if (req.city) {
      whereClause += ` AND LOWER(city) LIKE LOWER($${paramIndex})`;
      params.push(`%${req.city}%`);
      paramIndex++;
    }

    if (req.state) {
      whereClause += ` AND LOWER(state) LIKE LOWER($${paramIndex})`;
      params.push(`%${req.state}%`);
      paramIndex++;
    }

    if (req.country) {
      whereClause += ` AND LOWER(country) LIKE LOWER($${paramIndex})`;
      params.push(`%${req.country}%`);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM schools
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        description,
        address,
        city,
        state,
        country,
        postal_code as "postalCode",
        phone,
        email,
        website,
        logo_url as "logoUrl",
        established_year as "establishedYear",
        school_type as "schoolType",
        grade_levels as "gradeLevels",
        student_capacity as "studentCapacity",
        current_enrollment as "currentEnrollment",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM schools
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await coreDB.queryRow<{ total: number }>(countQuery, ...params);
    const schools = await coreDB.queryAll<School>(dataQuery, ...params, limit, offset);

    return {
      schools,
      total: countResult?.total || 0
    };
  }
);
