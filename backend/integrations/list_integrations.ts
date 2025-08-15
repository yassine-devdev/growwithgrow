import { api } from "encore.dev/api";
import { integrationsDB } from "./db";
import type { Integration } from "./types";

export interface ListIntegrationsRequest {
  provider?: string;
  integrationType?: string;
  status?: string;
  schoolId?: number;
  limit?: number;
  offset?: number;
}

export interface ListIntegrationsResponse {
  integrations: Integration[];
  total: number;
}

// Retrieves a list of integrations.
export const listIntegrations = api<ListIntegrationsRequest, ListIntegrationsResponse>(
  { expose: true, method: "GET", path: "/integrations" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.provider) {
      whereClause += ` AND provider = $${paramIndex}`;
      params.push(req.provider);
      paramIndex++;
    }

    if (req.integrationType) {
      whereClause += ` AND integration_type = $${paramIndex}`;
      params.push(req.integrationType);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM integrations
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
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
      FROM integrations
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await integrationsDB.queryRow<{ total: number }>(countQuery, ...params);
    const integrations = await integrationsDB.queryAll<Integration>(dataQuery, ...params, limit, offset);

    return {
      integrations,
      total: countResult?.total || 0
    };
  }
);
