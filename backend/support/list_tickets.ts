import { api } from "encore.dev/api";
import { supportDB } from "./db";
import type { Ticket } from "./types";

export interface ListTicketsRequest {
  status?: string;
  priority?: string;
  createdBy?: number;
  assignedTo?: number;
  schoolId?: number;
  limit?: number;
  offset?: number;
}

export interface ListTicketsResponse {
  tickets: Ticket[];
  total: number;
}

// Retrieves a list of support tickets.
export const listTickets = api<ListTicketsRequest, ListTicketsResponse>(
  { expose: true, method: "GET", path: "/support/tickets" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    if (req.priority) {
      whereClause += ` AND priority = $${paramIndex}`;
      params.push(req.priority);
      paramIndex++;
    }

    if (req.createdBy) {
      whereClause += ` AND created_by = $${paramIndex}`;
      params.push(req.createdBy);
      paramIndex++;
    }

    if (req.assignedTo) {
      whereClause += ` AND assigned_to = $${paramIndex}`;
      params.push(req.assignedTo);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM tickets
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        subject,
        description,
        status,
        priority,
        category,
        created_by as "createdBy",
        assigned_to as "assignedTo",
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt",
        resolved_at as "resolvedAt"
      FROM tickets
      ${whereClause}
      ORDER BY updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await supportDB.queryRow<{ total: number }>(countQuery, ...params);
    const tickets = await supportDB.queryAll<Ticket>(dataQuery, ...params, limit, offset);

    return {
      tickets,
      total: countResult?.total || 0
    };
  }
);
