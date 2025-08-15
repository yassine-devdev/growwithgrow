import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";
import type { User } from "./types";

export interface GetUserRequest {
  id: number;
}

// Retrieves a specific user by ID.
export const getUser = api<GetUserRequest, User>(
  { expose: true, method: "GET", path: "/users/:id" },
  async (req) => {
    const user = await coreDB.queryRow<User>`
      SELECT 
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
      FROM users 
      WHERE id = ${req.id} AND is_active = TRUE
    `;

    if (!user) {
      throw APIError.notFound("User not found");
    }

    return user;
  }
);
