import { api, APIError } from "encore.dev/api";
import { integrationsDB } from "./db";
import type { SyncLog } from "./types";

export interface SyncIntegrationRequest {
  integrationId: number;
  syncType?: string;
}

export interface SyncIntegrationResponse {
  syncLog: SyncLog;
}

// Triggers a sync for an integration.
export const syncIntegration = api<SyncIntegrationRequest, SyncIntegrationResponse>(
  { expose: true, method: "POST", path: "/integrations/:integrationId/sync" },
  async (req) => {
    // Check if integration exists and is active
    const integration = await integrationsDB.queryRow`
      SELECT id, status FROM integrations 
      WHERE id = ${req.integrationId}
    `;

    if (!integration) {
      throw APIError.notFound("Integration not found");
    }

    if (integration.status !== 'active') {
      throw APIError.failedPrecondition("Integration is not active");
    }

    // Create sync log
    const syncLog = await integrationsDB.queryRow<SyncLog>`
      INSERT INTO sync_logs (
        integration_id, sync_type, status
      )
      VALUES (
        ${req.integrationId}, ${req.syncType || 'manual'}, 'started'
      )
      RETURNING 
        id,
        integration_id as "integrationId",
        sync_type as "syncType",
        status,
        records_processed as "recordsProcessed",
        records_created as "recordsCreated",
        records_updated as "recordsUpdated",
        records_failed as "recordsFailed",
        error_message as "errorMessage",
        started_at as "startedAt",
        completed_at as "completedAt",
        duration_seconds as "durationSeconds"
    `;

    // Update integration last sync time
    await integrationsDB.exec`
      UPDATE integrations 
      SET last_sync = NOW(), updated_at = NOW()
      WHERE id = ${req.integrationId}
    `;

    // TODO: Implement actual sync logic based on integration type and provider
    // This would typically involve calling external APIs and processing data

    // For now, mark sync as completed
    await integrationsDB.exec`
      UPDATE sync_logs 
      SET status = 'completed', completed_at = NOW(),
          duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))
      WHERE id = ${syncLog!.id}
    `;

    return { syncLog: syncLog! };
  }
);
