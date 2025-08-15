import { api, APIError } from "encore.dev/api";
import { marketplaceDB } from "./db";
import type { Review } from "./types";

export interface CreateReviewRequest {
  productId: number;
  customerId: number;
  rating: number;
  title?: string;
  content?: string;
}

// Creates a new product review.
export const createReview = api<CreateReviewRequest, Review>(
  { expose: true, method: "POST", path: "/marketplace/reviews" },
  async (req) => {
    if (req.rating < 1 || req.rating > 5) {
      throw APIError.invalidArgument("Rating must be between 1 and 5");
    }

    const existing = await marketplaceDB.queryRow`
      SELECT id FROM reviews 
      WHERE product_id = ${req.productId} AND customer_id = ${req.customerId}
    `;
    if (existing) {
      throw APIError.alreadyExists("You have already reviewed this product.");
    }

    // Check if customer purchased the product
    const verifiedPurchase = await marketplaceDB.queryRow`
      SELECT o.id FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.customer_id = ${req.customerId}
      AND oi.product_id = ${req.productId}
      AND o.status = 'delivered'
    `;

    await using tx = await marketplaceDB.begin();

    const review = await tx.queryRow<Review>`
      INSERT INTO reviews (
        product_id, customer_id, rating, title, content, verified_purchase
      )
      VALUES (
        ${req.productId}, ${req.customerId}, ${req.rating},
        ${req.title}, ${req.content}, ${!!verifiedPurchase}
      )
      RETURNING 
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
    `;

    // Update product's average rating and review count
    await tx.exec`
      UPDATE products
      SET 
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ${req.productId} AND status = 'approved'),
        rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ${req.productId} AND status = 'approved')
      WHERE id = ${req.productId}
    `;

    return review!;
  }
);
