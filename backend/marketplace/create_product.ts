import { api } from "encore.dev/api";
import { marketplaceDB } from "./db";
import type { Product } from "./types";

export interface CreateProductRequest {
  name: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  price: number;
  salePrice?: number;
  currency?: string;
  categoryId?: number;
  brand?: string;
  weight?: number;
  dimensions?: any;
  images?: string[];
  tags?: string[];
  stockQuantity?: number;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'on_backorder';
  manageStock?: boolean;
  featured?: boolean;
  status?: 'draft' | 'published' | 'private';
  visibility?: 'visible' | 'catalog' | 'search' | 'hidden';
  createdBy: number;
  schoolId?: number;
}

// Creates a new product.
export const createProduct = api<CreateProductRequest, Product>(
  { expose: true, method: "POST", path: "/marketplace/products" },
  async (req) => {
    const product = await marketplaceDB.queryRow<Product>`
      INSERT INTO products (
        name, description, short_description, sku, price, sale_price, currency,
        category_id, brand, weight, dimensions, images, tags, stock_quantity,
        stock_status, manage_stock, featured, status, visibility, created_by, school_id
      )
      VALUES (
        ${req.name}, ${req.description}, ${req.shortDescription}, ${req.sku},
        ${req.price}, ${req.salePrice}, ${req.currency || 'USD'}, ${req.categoryId},
        ${req.brand}, ${req.weight}, ${req.dimensions}, ${req.images}, ${req.tags},
        ${req.stockQuantity || 0}, ${req.stockStatus || 'in_stock'}, ${req.manageStock !== false},
        ${req.featured || false}, ${req.status || 'draft'}, ${req.visibility || 'visible'},
        ${req.createdBy}, ${req.schoolId}
      )
      RETURNING 
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
    `;

    return product!;
  }
);
