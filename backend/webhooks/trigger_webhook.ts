import { api } from "encore.dev/api";
import { webhooksDB } from "./db";
import type { WebhookDelivery } from "./types";

export interface TriggerWebhookRequest {
  eventType: string;
  payload: any;
  schoolId?: number;
}

export interface TriggerWebhookResponse {
  deliveries: WebhookDelivery[];
}

// Triggers webhooks for a specific event.
export const triggerWebhook = api<TriggerWebhookRequest, TriggerWebhookResponse>(
  { expose: true, method: "POST", path: "/webhooks/trigger" },
  async (req) => {
    // Find all active endpoints that listen for this event type
    let whereClause = "WHERE is_active = TRUE AND $1 = ANY(events)";
    const params: any[] = [req.eventType];
    let paramIndex = 2;

    if (req.schoolId) {
      whereClause += ` AND (school_id = $${paramIndex} OR school_id IS NULL)`;
      params.push(req.schoolId);
      paramIndex++;
    }

    const endpoints = await webhooksDB.queryAll<{ id: number }>`
      SELECT id FROM webhook_endpoints ${whereClause}
    `;

    const deliveries: WebhookDelivery[] = [];

    // Create delivery records for each endpoint
    for (const endpoint of endpoints) {
      const delivery = await webhooksDB.queryRow<WebhookDelivery>`
        INSERT INTO webhook_deliveries (
          endpoint_id, event_type, payload, next_retry_at
        )
        VALUES (
          ${endpoint.id}, ${req.eventType}, ${req.payload}, NOW()
        )
        RETURNING 
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
      `;

      if (delivery) {
        deliveries.push(delivery);
      }
    }

    // TODO: Process webhook deliveries asynchronously
    // This would typically be done by a background job processor

    return { deliveries };
  }
);
