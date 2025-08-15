import { api } from "encore.dev/api";
import { webhooksDB } from "./db";
import type { WebhookEndpoint } from "./types";

export interface CreateWebhookEndpointRequest {
  name: string;
  url: string;
  events: string[];
  secret?: string;
  headers?: any;
  retryCount?: number;
  timeoutSeconds?: number;
  schoolId?: number;
  createdBy: number;
}

// Creates a new webhook endpoint.
export const createWebhookEndpoint = api<CreateWebhookEndpointRequest, WebhookEndpoint>(
  { expose: true, method: "POST", path: "/webhooks/endpoints" },
  async (req) => {
    const endpoint = await webhooksDB.queryRow<WebhookEndpoint>`
      INSERT INTO webhook_endpoints (
        name, url, events, secret, headers, retry_count,
        timeout_seconds, school_id, created_by
      )
      VALUES (
        ${req.name}, ${req.url}, ${req.events}, ${req.secret},
        ${req.headers}, ${req.retryCount || 3}, ${req.timeoutSeconds || 30},
        ${req.schoolId}, ${req.createdBy}
      )
      RETURNING 
        id,
        name,
        url,
        events,
        secret,
        headers,
        is_active as "isActive",
        retry_count as "retryCount",
        timeout_seconds as "timeoutSeconds",
        school_id as "schoolId",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return endpoint!;
  }
);
