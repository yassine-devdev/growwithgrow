import { api } from "encore.dev/api";
import { marketplaceDB } from "./db";
import type { Order } from "./types";

export interface ListOrdersRequest {
  customerId?: number;
  status?: string;
  paymentStatus?: string;
  schoolId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ListOrdersResponse {
  orders: Order[];
  total: number;
}

// Retrieves a list of orders with optional filtering.
export const listOrders = api<ListOrdersRequest, ListOrdersResponse>(
  { expose: true, method: "GET", path: "/marketplace/orders" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.customerId) {
      whereClause += ` AND customer_id = $${paramIndex}`;
      params.push(req.customerId);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    if (req.paymentStatus) {
      whereClause += ` AND payment_status = $${paramIndex}`;
      params.push(req.paymentStatus);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.startDate) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(req.endDate);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        order_number as "orderNumber",
        customer_id as "customerId",
        status,
        currency,
        subtotal,
        tax_amount as "taxAmount",
        shipping_amount as "shippingAmount",
        discount_amount as "discountAmount",
        total_amount as "totalAmount",
        payment_method as "paymentMethod",
        payment_status as "paymentStatus",
        billing_address as "billingAddress",
        shipping_address as "shippingAddress",
        notes,
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await marketplaceDB.queryRow<{ total: number }>(countQuery, ...params);
    const orders = await marketplaceDB.queryAll<Order>(dataQuery, ...params, limit, offset);

    return {
      orders,
      total: countResult?.total || 0
    };
  }
);
