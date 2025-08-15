import { api } from "encore.dev/api";
import { coreDB } from "./db";
import type { User } from "./types";

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'provider';
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Creates a new user.
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    const user = await coreDB.queryRow<User>`
      INSERT INTO users (
        email, first_name, last_name, role, avatar_url, phone, 
        date_of_birth, address, city, state, country, postal_code
      )
      VALUES (
        ${req.email}, ${req.firstName}, ${req.lastName}, ${req.role}, 
        ${req.avatarUrl}, ${req.phone}, ${req.dateOfBirth}, ${req.address}, 
        ${req.city}, ${req.state}, ${req.country}, ${req.postalCode}
      )
      RETURNING 
        id,
        email,
        first_name as "firstName",
        last_name as "lastName",
        role,
        avatar_url as "avatarUrl",
        phone,
        date_of_birth as "dateOfBirth",
        address,
        city,
        state,
        country,
        postal_code as "postalCode",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return user!;
  }
);
