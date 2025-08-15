import { api } from "encore.dev/api";
import { knowledgeDB } from "./db";
import type { StoreItem } from "./types";

export interface CreateStoreItemRequest {
  title: string;
  description?: string;
  itemType: 'book' | 'course' | 'exam' | 'bundle' | 'subscription';
  price: number;
  currency?: string;
  discountPercentage?: number;
  category?: string;
  subject?: string;
  gradeLevel?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  previewUrl?: string;
  contentUrl?: string;
  fileSize?: number;
  durationHours?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  learningOutcomes?: string[];
  tags?: string[];
  isFeatured?: boolean;
  isAvailable?: boolean;
  createdBy: number;
}

// Creates a new store item.
export const createStoreItem = api<CreateStoreItemRequest, StoreItem>(
  { expose: true, method: "POST", path: "/knowledge/store" },
  async (req) => {
    const item = await knowledgeDB.queryRow<StoreItem>`
      INSERT INTO store_items (
        title, description, item_type, price, currency, discount_percentage,
        category, subject, grade_level, author, publisher, isbn, preview_url,
        content_url, file_size, duration_hours, difficulty, prerequisites,
        learning_outcomes, tags, is_featured, is_available, created_by
      )
      VALUES (
        ${req.title}, ${req.description}, ${req.itemType}, ${req.price},
        ${req.currency || 'USD'}, ${req.discountPercentage || 0}, ${req.category},
        ${req.subject}, ${req.gradeLevel}, ${req.author}, ${req.publisher},
        ${req.isbn}, ${req.previewUrl}, ${req.contentUrl}, ${req.fileSize},
        ${req.durationHours}, ${req.difficulty}, ${req.prerequisites},
        ${req.learningOutcomes}, ${req.tags}, ${req.isFeatured || false},
        ${req.isAvailable !== false}, ${req.createdBy}
      )
      RETURNING 
        id,
        title,
        description,
        item_type as "itemType",
        price,
        currency,
        discount_percentage as "discountPercentage",
        category,
        subject,
        grade_level as "gradeLevel",
        author,
        publisher,
        isbn,
        preview_url as "previewUrl",
        content_url as "contentUrl",
        file_size as "fileSize",
        duration_hours as "durationHours",
        difficulty,
        prerequisites,
        learning_outcomes as "learningOutcomes",
        tags,
        rating,
        review_count as "reviewCount",
        purchase_count as "purchaseCount",
        is_featured as "isFeatured",
        is_available as "isAvailable",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return item!;
  }
);
