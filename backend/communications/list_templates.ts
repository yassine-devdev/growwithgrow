import { api } from "encore.dev/api";
import { communicationsDB } from "./db";
import type { EmailTemplate } from "./types";

export interface ListTemplatesRequest {
  templateType?: string;
  category?: string;
  createdBy?: number;
  limit?: number;
  offset?: number;
}

export interface ListTemplatesResponse {
  templates: EmailTemplate[];
  total: number;
}

// Retrieves a list of email templates.
export const listTemplates = api<ListTemplatesRequest, ListTemplatesResponse>(
  { expose: true, method: "GET", path: "/communications/templates" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE is_active = TRUE";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.templateType) {
      whereClause += ` AND template_type = $${paramIndex}`;
      params.push(req.templateType);
      paramIndex++;
    }

    if (req.category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(req.category);
      paramIndex++;
    }

    if (req.createdBy) {
      whereClause += ` AND created_by = $${paramIndex}`;
      params.push(req.createdBy);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM email_templates
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        subject,
        body,
        html_body as "htmlBody",
        template_type as "templateType",
        category,
        variables,
        created_by as "createdBy",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM email_templates
      ${whereClause}
      ORDER BY name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await communicationsDB.queryRow<{ total: number }>(countQuery, ...params);
    const templates = await communicationsDB.queryAll<EmailTemplate>(dataQuery, ...params, limit, offset);

    return {
      templates,
      total: countResult?.total || 0
    };
  }
);
