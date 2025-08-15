import { api } from "encore.dev/api";
import { marketplaceDB } from "./db";
import type { Category } from "./types";

export interface ListCategoriesRequest {
  parentId?: number;
}

export interface ListCategoriesResponse {
  categories: Category[];
}

// Retrieves a list of product categories.
export const listCategories = api<ListCategoriesRequest, ListCategoriesResponse>(
  { expose: true, method: "GET", path: "/marketplace/categories" },
  async (req) => {
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.parentId !== undefined) {
      if (req.parentId === null) {
        whereClause += ` AND parent_id IS NULL`;
      } else {
        whereClause += ` AND parent_id = $${paramIndex}`;
        params.push(req.parentId);
        paramIndex++;
      }
    }

    const query = `
      SELECT 
        id,
        name,
        slug,
        description,
        parent_id as "parentId",
        image_url as "imageUrl",
        display_order as "displayOrder",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM categories
      ${whereClause}
      ORDER BY display_order, name
    `;

    const categories = await marketplaceDB.queryAll<Category>(query, ...params);

    return { categories };
  }
);
