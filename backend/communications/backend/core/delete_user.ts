import { api, APIError } from "encore.dev/api";
import { coreDB } from "./db";

export interface DeleteUserRequest {
  id: number;
}

// Soft deletes a user by setting is_active to false.
export const deleteUser = api<DeleteUserRequest, void>(
  { expose: true, method: "DELETE", path: "/users/:id" },
  async (req) => {
    const result = await coreDB.queryRow`
      UPDATE users 
      SET is_active = FALSE, updated_at = NOW()
      WHERE id = ${req.id} AND is_active = TRUE
      RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("User not found");
    }
  }
);
