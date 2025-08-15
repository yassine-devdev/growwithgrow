import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { User } from "./types";

export interface UpdateUserRequest {
  id: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'teacher' | 'student' | 'parent' | 'provider';
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Updates an existing user.
export const updateUser = api<UpdateUserRequest, User>(
  { expose: true, method: "PUT", path: "/users/:id" },
  async (req) => {
    const existingUser = await coreDB.queryRow`
      SELECT id FROM users WHERE id = ${req.id} AND is_active = TRUE
    `;

    if (!existingUser) {
      throw APIError.notFound("User not found");
    }

    const user = await coreDB.queryRow<User>`
      UPDATE users SET
        email = COALESCE(${req.email}, email),
        first_name = COALESCE(${req.firstName}, first_name),
        last_name = COALESCE(${req.lastName}, last_name),
        role = COALESCE(${req.role}, role),
        avatar_url = COALESCE(${req.avatarUrl}, avatar_url),
        phone = COALESCE(${req.phone}, phone),
        date_of_birth = COALESCE(${req.dateOfBirth}, date_of_birth),
        address = COALESCE(${req.address}, address),
        city = COALESCE(${req.city}, city),
        state = COALESCE(${req.state}, state),
        country = COALESCE(${req.country}, country),
        postal_code = COALESCE(${req.postalCode}, postal_code),
        updated_at = NOW()
      WHERE id = ${req.id}
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
