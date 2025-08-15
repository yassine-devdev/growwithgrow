import { api } from "encore.dev/api";
import { communicationsDB } from "./db";
import type { EmailTemplate } from "./types";

export interface CreateTemplateRequest {
  name: string;
  subject: string;
  body: string;
  htmlBody?: string;
  templateType: 'personal' | 'public' | 'system';
  category?: string;
  variables?: string[];
  createdBy: number;
}

// Creates a new email template.
export const createTemplate = api<CreateTemplateRequest, EmailTemplate>(
  { expose: true, method: "POST", path: "/communications/templates" },
  async (req) => {
    const template = await communicationsDB.queryRow<EmailTemplate>`
      INSERT INTO email_templates (
        name, subject, body, html_body, template_type, category,
        variables, created_by
      )
      VALUES (
        ${req.name}, ${req.subject}, ${req.body}, ${req.htmlBody},
        ${req.templateType}, ${req.category}, ${req.variables}, ${req.createdBy}
      )
      RETURNING 
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
    `;

    return template!;
  }
);
