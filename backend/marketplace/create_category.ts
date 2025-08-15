import { api, APIError } from "encore.dev/api";
import { marketplaceDB } from "./db";
import type { Category } from "./types";

function slugify(text: string): string {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: number;
  imageUrl?: string;
  displayOrder?: number;
}

// Creates a new product category.
export const createCategory = api<CreateCategoryRequest, Category>(
  { expose: true, method: "POST", path: "/marketplace/categories" },
  async (req) => {
    const slug = slugify(req.name);

    const existing = await marketplaceDB.queryRow`
      SELECT id FROM categories WHERE slug = ${slug}
    `;
    if (existing) {
      throw APIError.alreadyExists("A category with this name already exists.");
    }

    const category = await marketplaceDB.queryRow<Category>`
      INSERT INTO categories (
        name, slug, description, parent_id, image_url, display_order
      )
      VALUES (
        ${req.name}, ${slug}, ${req.description}, ${req.parentId},
        ${req.imageUrl}, ${req.displayOrder || 0}
      )
      RETURNING 
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
    `;

    return category!;
  }
);
