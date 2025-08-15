import { api } from "encore.dev/api";
import { integrationsDB } from "./db";
import type { Integration } from "./types";

export interface CreateIntegrationRequest {
  name: string;
  provider: string;
  integrationType: 'sso' | 'calendar' | 'email' | 'video' | 'storage' | 'lms' | 'payment';
  config: any;
  credentials?: any;
  webhookUrl?: string;
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  schoolId?: number;
  createdBy: number;
}

// Creates a new integration.
export const createIntegration = api<CreateIntegrationRequest, Integration>(
  { expose: true, method: "POST", path: "/integrations" },
  async (req) => {
    const integration = await integrationsDB.queryRow<Integration>`
      INSERT INTO integrations (
        name, provider, integration_type, config, credentials,
        webhook_url, sync_frequency, school_id, created_by
      )
      VALUES (
        ${req.name}, ${req.provider}, ${req.integrationType}, ${req.config},
        ${req.credentials}, ${req.webhookUrl}, ${req.syncFrequency || 'daily'},
        ${req.schoolId}, ${req.createdBy}
      )
      RETURNING 
        id,
        name,
        provider,
        integration_type as "integrationType",
        status,
        config,
        webhook_url as "webhookUrl",
        last_sync as "lastSync",
        sync_frequency as "syncFrequency",
        error_message as "errorMessage",
        school_id as "schoolId",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return integration!;
  }
);
