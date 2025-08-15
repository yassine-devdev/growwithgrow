import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { School } from "./types";

export interface GetSchoolRequest {
  id: number;
}

// Retrieves a specific school by ID.
export const getSchool = api<GetSchoolRequest, School>(
  { expose: true, method: "GET", path: "/schools/:id" },
  async (req) => {
    const school = await coreDB.queryRow<School>`
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
      WHERE id = ${req.id} AND is_active = TRUE
    `;

    if (!school) {
      throw APIError.notFound("School not found");
    }

    return school;
  }
);
