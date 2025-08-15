import { api } from "encore.dev/api";
import { marketplaceDB } from "./db";
import type { Product } from "./types";

export interface ListProductsRequest {
  categoryId?: number;
  status?: string;
  featured?: boolean;
  schoolId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListProductsResponse {
  products: Product[];
  total: number;
}

// Retrieves a list of products with optional filtering.
export const listProducts = api<ListProductsRequest, ListProductsResponse>(
  { expose: true, method: "GET", path: "/marketplace/products" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.categoryId) {
      whereClause += ` AND category_id = $${paramIndex}`;
      params.push(req.categoryId);
      paramIndex++;
    }

    if (req.status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    if (req.featured !== undefined) {
      whereClause += ` AND featured = $${paramIndex}`;
      params.push(req.featured);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.search) {
      whereClause += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(description) LIKE LOWER($${paramIndex + 1}))`;
      params.push(`%${req.search}%`, `%${req.search}%`);
      paramIndex += 2;
    }

    if (req.minPrice !== undefined) {
      whereClause += ` AND price >= $${paramIndex}`;
      params.push(req.minPrice);
      paramIndex++;
    }

    if (req.maxPrice !== undefined) {
      whereClause += ` AND price <= $${paramIndex}`;
      params.push(req.maxPrice);
      paramIndex++;
    }

    if (req.inStock) {
      whereClause += ` AND stock_status = 'in_stock' AND stock_quantity > 0`;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM products
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        name,
        description,
        short_description as "shortDescription",
        sku,
        price,
        sale_price as "salePrice",
        currency,
        category_id as "categoryId",
        brand,
        weight,
        dimensions,
        images,
        tags,
        stock_quantity as "stockQuantity",
        stock_status as "stockStatus",
        manage_stock as "manageStock",
        featured,
        status,
        visibility,
        rating,
        review_count as "reviewCount",
        total_sales as "totalSales",
        created_by as "createdBy",
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM products
      ${whereClause}
      ORDER BY featured DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countResult = await marketplaceDB.queryRow<{ total: number }>(countQuery, ...params);
    const products = await marketplaceDB.queryAll<Product>(dataQuery, ...params, limit, offset);

    return {
      products,
      total: countResult?.total || 0
    };
  }
);
