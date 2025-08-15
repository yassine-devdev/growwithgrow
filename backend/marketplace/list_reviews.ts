import { api } from "encore.dev/api";
import { marketplaceDB } from "./db";
import type { Review } from "./types";

export interface ListReviewsRequest {
  productId: number;
  limit?: number;
  offset?: number;
}

export interface ListReviewsResponse {
  reviews: Review[];
  total: number;
}

// Retrieves reviews for a product.
export const listReviews = api<ListReviewsRequest, ListReviewsResponse>(
  { expose: true, method: "GET", path: "/marketplace/products/:productId/reviews" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;
    
    const whereClause = "WHERE product_id = $1 AND status = 'approved'";
    const params = [req.productId];

    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        product_id as "productId",
        customer_id as "customerId",
        rating,
        title,
        content,
        verified_purchase as "verifiedPurchase",
        helpful_count as "helpfulCount",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM reviews
      ${whereClause}
      ORDER BY helpful_count DESC, created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countResult = await marketplaceDB.queryRow<{ total: number }>(countQuery, ...params);
    const reviews = await marketplaceDB.queryAll<Review>(dataQuery, ...params, limit, offset);

    return {
      reviews,
      total: countResult?.total || 0
    };
  }
);
