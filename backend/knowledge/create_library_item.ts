import { api } from "encore.dev/api";
import { knowledgeDB } from "./db";
import type { LibraryItem } from "./types";

export interface CreateLibraryItemRequest {
  title: string;
  description?: string;
  itemType: 'book' | 'article' | 'video' | 'audio' | 'document' | 'image' | 'link';
  contentUrl?: string;
  fileSize?: number;
  durationSeconds?: number;
  author?: string;
  publisher?: string;
  publicationDate?: Date;
  isbn?: string;
  subject?: string;
  gradeLevel?: string;
  language?: string;
  tags?: string[];
  accessLevel?: 'public' | 'restricted' | 'private';
  createdBy: number;
  schoolId?: number;
}

// Creates a new library item.
export const createLibraryItem = api<CreateLibraryItemRequest, LibraryItem>(
  { expose: true, method: "POST", path: "/knowledge/library" },
  async (req) => {
    const item = await knowledgeDB.queryRow<LibraryItem>`
      INSERT INTO library_items (
        title, description, item_type, content_url, file_size, duration_seconds,
        author, publisher, publication_date, isbn, subject, grade_level,
        language, tags, access_level, created_by, school_id
      )
      VALUES (
        ${req.title}, ${req.description}, ${req.itemType}, ${req.contentUrl},
        ${req.fileSize}, ${req.durationSeconds}, ${req.author}, ${req.publisher},
        ${req.publicationDate}, ${req.isbn}, ${req.subject}, ${req.gradeLevel},
        ${req.language || 'en'}, ${req.tags}, ${req.accessLevel || 'public'},
        ${req.createdBy}, ${req.schoolId}
      )
      RETURNING 
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
    `;

    return item!;
  }
);
