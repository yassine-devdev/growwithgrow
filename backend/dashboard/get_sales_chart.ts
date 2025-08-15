import { api } from "encore.dev/api";
import { dashboardDB } from "./db";
import type { SalesData } from "./types";

export interface GetSalesChartRequest {
  schoolId?: number;
  startDate?: Date;
  endDate?: Date;
  productCategory?: string;
}

export interface GetSalesChartResponse {
  salesData: SalesData[];
}

// Retrieves sales chart data for the dashboard.
export const getSalesChart = api<GetSalesChartRequest, GetSalesChartResponse>(
  { expose: true, method: "GET", path: "/dashboard/sales-chart" },
  async (req) => {
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.startDate) {
      whereClause += ` AND date >= $${paramIndex}`;
      params.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      whereClause += ` AND date <= $${paramIndex}`;
      params.push(req.endDate);
      paramIndex++;
    }

    if (req.productCategory) {
      whereClause += ` AND product_category = $${paramIndex}`;
      params.push(req.productCategory);
      paramIndex++;
    }

    const query = `
      SELECT 
        id,
        date,
        revenue,
        transactions,
        new_customers as "newCustomers",
        product_category as "productCategory",
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM sales_data
      ${whereClause}
      ORDER BY date ASC
    `;

    const salesData = await dashboardDB.queryAll<SalesData>(query, ...params);

    return { salesData };
  }
);
