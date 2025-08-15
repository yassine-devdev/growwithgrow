import { api } from "encore.dev/api";
import { knowledgeDB } from "./db";
import type { LibraryItem } from "./types";

export interface ListLibraryItemsRequest {
  itemType?: string;
  subject?: string;
  gradeLevel?: string;
  author?: string;
  schoolId?: number;
  accessLevel?: string;
  limit?: number;
  offset?: number;
}

export interface ListLibraryItemsResponse {
  items: LibraryItem[];
  total: number;
}

// Retrieves a list of library items.
export const listLibraryItems = api<ListLibraryItemsRequest, ListLibraryItemsResponse>(
  { expose: true, method: "GET", path: "/knowledge/library" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.itemType) {
      whereClause += ` AND item_type = $${paramIndex}`;
      params.push(req.itemType);
      paramIndex++;
    }

    if (req.subject) {
      whereClause += ` AND LOWER(subject) LIKE LOWER($${paramIndex})`;
      params.push(`%${req.subject}%`);
      paramIndex++;
    }

    if (req.gradeLevel) {
      whereClause += ` AND grade_level = $${paramIndex}`;
      params.push(req.gradeLevel);
      paramIndex++;
    }

    if (req.author) {
      whereClause += ` AND LOWER(author) LIKE LOWER($${paramIndex})`;
      params.push(`%${req.author}%`);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.accessLevel) {
      whereClause += ` AND access_level = $${paramIndex}`;
      params.push(req.accessLevel);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM library_items
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        title,
        description,
        item_type as "itemType",
        content_url as "contentUrl",
        file_size as "fileSize",
        duration_seconds as "durationSeconds",
        author,
        publisher,
        publication_date as "publicationDate",
        isbn,
        subject,
        grade_level as "gradeLevel",
        language,
        tags,
        access_level as "accessLevel",
        download_count as "downloadCount",
        view_count as "viewCount",
        rating,
        created_by as "createdBy",
        school_id as "schoolId",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM library_items
      ${whereClause}
      ORDER BY title
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await knowledgeDB.queryRow<{ total: number }>(countQuery, ...params);
    const items = await knowledgeDB.queryAll<LibraryItem>(dataQuery, ...params, limit, offset);

    return {
      items,
      total: countResult?.total || 0
    };
  }
);
