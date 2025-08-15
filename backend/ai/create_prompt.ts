import { api } from "encore.dev/api";
import { aiDB } from "./db";
import type { Prompt } from "./types";

export interface CreatePromptRequest {
  name: string;
  description?: string;
  promptText: string;
  category: string;
  variables?: string[];
  isSystem?: boolean;
  createdBy: number;
}

// Creates a new prompt template.
export const createPrompt = api<CreatePromptRequest, Prompt>(
  { expose: true, method: "POST", path: "/ai/prompts" },
  async (req) => {
    const prompt = await aiDB.queryRow<Prompt>`
      INSERT INTO prompts (
        name, description, prompt_text, category, variables, is_system, created_by
      )
      VALUES (
        ${req.name}, ${req.description}, ${req.promptText}, ${req.category},
        ${req.variables}, ${req.isSystem || false}, ${req.createdBy}
      )
      RETURNING 
        id,
        name,
        description,
        prompt_text as "promptText",
        category,
        variables,
        is_system as "isSystem",
        is_active as "isActive",
        created_by as "createdBy",
        usage_count as "usageCount",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return prompt!;
  }
);
