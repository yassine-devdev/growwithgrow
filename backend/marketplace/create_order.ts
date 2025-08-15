import { api } from "encore.dev/api";
import { marketplaceDB } from "./db";
import type { Order, OrderItem } from "./types";

export interface CreateOrderRequest {
  customerId: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  currency?: string;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  paymentMethod?: string;
  billingAddress?: any;
  shippingAddress?: any;
  notes?: string;
  schoolId?: number;
}

export interface CreateOrderResponse {
  order: Order;
  items: OrderItem[];
}

// Creates a new order with items.
export const createOrder = api<CreateOrderRequest, CreateOrderResponse>(
  { expose: true, method: "POST", path: "/marketplace/orders" },
  async (req) => {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Calculate subtotal
    const subtotal = req.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = req.taxAmount || 0;
    const shippingAmount = req.shippingAmount || 0;
    const discountAmount = req.discountAmount || 0;
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Create order
    const order = await marketplaceDB.queryRow<Order>`
      INSERT INTO orders (
        order_number, customer_id, currency, subtotal, tax_amount,
        shipping_amount, discount_amount, total_amount, payment_method,
        billing_address, shipping_address, notes, school_id
      )
      VALUES (
        ${orderNumber}, ${req.customerId}, ${req.currency || 'USD'}, ${subtotal},
        ${taxAmount}, ${shippingAmount}, ${discountAmount}, ${totalAmount},
        ${req.paymentMethod}, ${req.billingAddress}, ${req.shippingAddress},
        ${req.notes}, ${req.schoolId}
      )
      RETURNING 
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
    `;

    // Create order items
    const items: OrderItem[] = [];
    for (const item of req.items) {
      // Get product details
      const product = await marketplaceDB.queryRow<{ name: string; sku: string }>`
        SELECT name, sku FROM products WHERE id = ${item.productId}
      `;

      if (product) {
        const orderItem = await marketplaceDB.queryRow<OrderItem>`
          INSERT INTO order_items (
            order_id, product_id, product_name, product_sku,
            quantity, price, total
          )
          VALUES (
            ${order!.id}, ${item.productId}, ${product.name}, ${product.sku},
            ${item.quantity}, ${item.price}, ${item.price * item.quantity}
          )
          RETURNING 
            id,
            order_id as "orderId",
            product_id as "productId",
            product_name as "productName",
            product_sku as "productSku",
            quantity,
            price,
            total,
            created_at as "createdAt"
        `;

        if (orderItem) {
          items.push(orderItem);
        }

        // Update product stock if managed
        await marketplaceDB.exec`
          UPDATE products 
          SET stock_quantity = GREATEST(0, stock_quantity - ${item.quantity}),
              total_sales = total_sales + ${item.quantity}
          WHERE id = ${item.productId} AND manage_stock = TRUE
        `;
      }
    }

    return {
      order: order!,
      items
    };
  }
);
