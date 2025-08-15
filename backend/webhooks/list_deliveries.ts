import { api } from "encore.dev/api";
import { webhooksDB } from "./db";
import type { WebhookDelivery } from "./types";

export interface ListWebhookDeliveriesRequest {
  endpointId?: number;
  eventType?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ListWebhookDeliveriesResponse {
  deliveries: WebhookDelivery[];
  total: number;
}

// Retrieves webhook deliveries.
export const listWebhookDeliveries = api<ListWebhookDeliveriesRequest, ListWebhookDeliveriesResponse>(
  { expose: true, method: "GET", path: "/webhooks/deliveries" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.endpointId) {
      whereClause += ` AND endpoint_id = $${paramIndex}`;
      params.push(req.endpointId);
      paramIndex++;
    }

    if (req.eventType) {
      whereClause += ` AND event_type = $${paramIndex}`;
      params.push(req.eventType);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM webhook_deliveries
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        endpoint_id as "endpointId",
        event_type as "eventType",
        payload,
        status,
        response_status as "responseStatus",
        response_body as "responseBody",
        response_headers as "responseHeaders",
        attempt_count as "attemptCount",
        next_retry_at as "nextRetryAt",
        delivered_at as "deliveredAt",
        created_at as "createdAt"
      FROM webhook_deliveries
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await webhooksDB.queryRow<{ total: number }>(countQuery, ...params);
    const deliveries = await webhooksDB.queryAll<WebhookDelivery>(dataQuery, ...params, limit, offset);

    return {
      deliveries,
      total: countResult?.total || 0
    };
  }
);
