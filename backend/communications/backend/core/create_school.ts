import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { School } from "./types";

export interface CreateSchoolRequest {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  establishedYear?: number;
  schoolType: 'public' | 'private' | 'charter' | 'international';
  gradeLevels: string[];
  studentCapacity?: number;
}

// Creates a new school.
export const createSchool = api<CreateSchoolRequest, School>(
  { expose: true, method: "POST", path: "/schools" },
  async (req) => {
    const school = await coreDB.queryRow<School>`
      INSERT INTO schools (
        name, description, address, city, state, country, postal_code,
        phone, email, website, logo_url, established_year, school_type,
        grade_levels, student_capacity
      )
      VALUES (
        ${req.name}, ${req.description}, ${req.address}, ${req.city}, 
        ${req.state}, ${req.country}, ${req.postalCode}, ${req.phone}, 
        ${req.email}, ${req.website}, ${req.logoUrl}, ${req.establishedYear}, 
        ${req.schoolType}, ${req.gradeLevels}, ${req.studentCapacity}
      )
      RETURNING 
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
    `;

    return school!;
  }
);
