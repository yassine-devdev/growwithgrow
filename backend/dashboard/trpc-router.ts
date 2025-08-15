import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc/router';
import { PaginationSchema, DateRangeSchema } from '../shared/types';
import { dashboardDB } from './db';

// Zod schemas for dashboard operations
const KPISchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  category: z.string(),
  description: z.string().optional(),
  targetValue: z.number().optional(),
  trend: z.enum(['up', 'down', 'stable']).optional(),
  periodStart: z.string(),
  periodEnd: z.string(),
  schoolId: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const GetKPIsInputSchema = z.object({
  schoolId: z.number().optional(),
  category: z.string().optional(),
}).merge(DateRangeSchema).merge(PaginationSchema);

const SalesDataSchema = z.object({
  id: z.number(),
  date: z.string(),
  revenue: z.number(),
  transactions: z.number(),
  newCustomers: z.number(),
  productCategory: z.string().optional(),
  schoolId: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const GetSalesChartInputSchema = z.object({
  schoolId: z.number().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
}).merge(DateRangeSchema);

const UserGrowthSchema = z.object({
  id: z.number(),
  date: z.string(),
  newUsers: z.number(),
  activeUsers: z.number(),
  totalUsers: z.number(),
  userType: z.enum(['student', 'teacher', 'parent', 'admin']).optional(),
  schoolId: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const AlertSchema = z.object({
  id: z.number(),
  title: z.string(),
  message: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string(),
  isRead: z.boolean(),
  isResolved: z.boolean(),
  schoolId: z.number().optional(),
  userId: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateAlertInputSchema = z.object({
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string().min(1).max(100),
  schoolId: z.number().optional(),
  userId: z.number().optional(),
});

// Dashboard router implementation
export const dashboardRouter = router({
  // Get KPIs with filtering and pagination
  getKPIs: protectedProcedure
    .input(GetKPIsInputSchema)
    .output(z.object({
      kpis: z.array(KPISchema),
      total: z.number(),
      hasMore: z.boolean(),
    }))
    .query(async ({ input, ctx }) => {
      let whereClause = "WHERE 1=1";
      const params: any[] = [];
      let paramIndex = 1;

      // Apply filters
      if (input.schoolId) {
        whereClause += ` AND school_id = $${paramIndex}`;
        params.push(input.schoolId);
        paramIndex++;
      }

      if (input.category) {
        whereClause += ` AND category = $${paramIndex}`;
        params.push(input.category);
        paramIndex++;
      }

      if (input.startDate) {
        whereClause += ` AND period_start >= $${paramIndex}`;
        params.push(input.startDate);
        paramIndex++;
      }

      if (input.endDate) {
        whereClause += ` AND period_end <= $${paramIndex}`;
        params.push(input.endDate);
        paramIndex++;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM kpis ${whereClause}`;
      const countResult = await dashboardDB.queryRow<{ total: number }>(countQuery, ...params);
      const total = countResult?.total || 0;

      // Get paginated data
      const dataQuery = `
        SELECT 
          id,
          name,
          value,
          unit,
          category,
          description,
          target_value as "targetValue",
          trend,
          period_start as "periodStart",
          period_end as "periodEnd",
          school_id as "schoolId",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM kpis
        ${whereClause}
        ORDER BY category, name
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const kpis = await dashboardDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

      return {
        kpis: kpis.map(kpi => ({
          ...kpi,
          periodStart: kpi.periodStart.toISOString(),
          periodEnd: kpi.periodEnd.toISOString(),
          createdAt: kpi.createdAt.toISOString(),
          updatedAt: kpi.updatedAt.toISOString(),
        })),
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get sales chart data
  getSalesChart: protectedProcedure
    .input(GetSalesChartInputSchema)
    .output(z.object({
      salesData: z.array(SalesDataSchema),
      summary: z.object({
        totalRevenue: z.number(),
        totalTransactions: z.number(),
        averageOrderValue: z.number(),
        growthRate: z.number(),
      }),
    }))
    .query(async ({ input, ctx }) => {
      let whereClause = "WHERE 1=1";
      const params: any[] = [];
      let paramIndex = 1;

      if (input.schoolId) {
        whereClause += ` AND school_id = $${paramIndex}`;
        params.push(input.schoolId);
        paramIndex++;
      }

      if (input.startDate) {
        whereClause += ` AND date >= $${paramIndex}`;
        params.push(input.startDate);
        paramIndex++;
      }

      if (input.endDate) {
        whereClause += ` AND date <= $${paramIndex}`;
        params.push(input.endDate);
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
        ORDER BY date DESC
      `;

      const salesData = await dashboardDB.queryAll<any>(query, ...params);

      // Calculate summary statistics
      const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
      const totalTransactions = salesData.reduce((sum, item) => sum + item.transactions, 0);
      const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      
      // Calculate growth rate (simplified)
      const growthRate = salesData.length > 1 ? 
        ((salesData[0].revenue - salesData[salesData.length - 1].revenue) / salesData[salesData.length - 1].revenue) * 100 : 0;

      return {
        salesData: salesData.map(item => ({
          ...item,
          date: item.date.toISOString(),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
        summary: {
          totalRevenue,
          totalTransactions,
          averageOrderValue,
          growthRate,
        },
      };
    }),

  // Get user growth data
  getUserGrowth: protectedProcedure
    .input(GetSalesChartInputSchema)
    .output(z.object({
      userGrowth: z.array(UserGrowthSchema),
      summary: z.object({
        totalUsers: z.number(),
        newUsersThisPeriod: z.number(),
        activeUsersThisPeriod: z.number(),
        growthRate: z.number(),
      }),
    }))
    .query(async ({ input, ctx }) => {
      let whereClause = "WHERE 1=1";
      const params: any[] = [];
      let paramIndex = 1;

      if (input.schoolId) {
        whereClause += ` AND school_id = $${paramIndex}`;
        params.push(input.schoolId);
        paramIndex++;
      }

      if (input.startDate) {
        whereClause += ` AND date >= $${paramIndex}`;
        params.push(input.startDate);
        paramIndex++;
      }

      if (input.endDate) {
        whereClause += ` AND date <= $${paramIndex}`;
        params.push(input.endDate);
        paramIndex++;
      }

      const query = `
        SELECT 
          id,
          date,
          new_users as "newUsers",
          active_users as "activeUsers",
          total_users as "totalUsers",
          user_type as "userType",
          school_id as "schoolId",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM user_growth
        ${whereClause}
        ORDER BY date DESC
      `;

      const userGrowth = await dashboardDB.queryAll<any>(query, ...params);

      // Calculate summary statistics
      const latestData = userGrowth[0];
      const totalUsers = latestData?.totalUsers || 0;
      const newUsersThisPeriod = userGrowth.reduce((sum, item) => sum + item.newUsers, 0);
      const activeUsersThisPeriod = Math.max(...userGrowth.map(item => item.activeUsers));
      
      // Calculate growth rate
      const growthRate = userGrowth.length > 1 ? 
        ((userGrowth[0].totalUsers - userGrowth[userGrowth.length - 1].totalUsers) / userGrowth[userGrowth.length - 1].totalUsers) * 100 : 0;

      return {
        userGrowth: userGrowth.map(item => ({
          ...item,
          date: item.date.toISOString(),
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
        summary: {
          totalUsers,
          newUsersThisPeriod,
          activeUsersThisPeriod,
          growthRate,
        },
      };
    }),

  // Get alerts
  getAlerts: protectedProcedure
    .input(z.object({
      schoolId: z.number().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      isRead: z.boolean().optional(),
      isResolved: z.boolean().optional(),
    }).merge(PaginationSchema))
    .output(z.object({
      alerts: z.array(AlertSchema),
      total: z.number(),
      unreadCount: z.number(),
      hasMore: z.boolean(),
    }))
    .query(async ({ input, ctx }) => {
      let whereClause = "WHERE 1=1";
      const params: any[] = [];
      let paramIndex = 1;

      if (input.schoolId) {
        whereClause += ` AND school_id = $${paramIndex}`;
        params.push(input.schoolId);
        paramIndex++;
      }

      if (input.severity) {
        whereClause += ` AND severity = $${paramIndex}`;
        params.push(input.severity);
        paramIndex++;
      }

      if (input.isRead !== undefined) {
        whereClause += ` AND is_read = $${paramIndex}`;
        params.push(input.isRead);
        paramIndex++;
      }

      if (input.isResolved !== undefined) {
        whereClause += ` AND is_resolved = $${paramIndex}`;
        params.push(input.isResolved);
        paramIndex++;
      }

      // Get total count and unread count
      const countQuery = `SELECT COUNT(*) as total FROM alerts ${whereClause}`;
      const unreadCountQuery = `SELECT COUNT(*) as unread FROM alerts ${whereClause} AND is_read = false`;
      
      const [countResult, unreadResult] = await Promise.all([
        dashboardDB.queryRow<{ total: number }>(countQuery, ...params),
        dashboardDB.queryRow<{ unread: number }>(unreadCountQuery, ...params),
      ]);

      const total = countResult?.total || 0;
      const unreadCount = unreadResult?.unread || 0;

      // Get paginated data
      const dataQuery = `
        SELECT 
          id,
          title,
          message,
          severity,
          category,
          is_read as "isRead",
          is_resolved as "isResolved",
          school_id as "schoolId",
          user_id as "userId",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM alerts
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const alerts = await dashboardDB.queryAll<any>(dataQuery, ...params, input.limit, input.offset);

      return {
        alerts: alerts.map(alert => ({
          ...alert,
          createdAt: alert.createdAt.toISOString(),
          updatedAt: alert.updatedAt.toISOString(),
        })),
        total,
        unreadCount,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create alert
  createAlert: protectedProcedure
    .input(CreateAlertInputSchema)
    .output(AlertSchema)
    .mutation(async ({ input, ctx }) => {
      const query = `
        INSERT INTO alerts (title, message, severity, category, school_id, user_id, is_read, is_resolved, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, false, false, NOW(), NOW())
        RETURNING 
          id,
          title,
          message,
          severity,
          category,
          is_read as "isRead",
          is_resolved as "isResolved",
          school_id as "schoolId",
          user_id as "userId",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;

      const result = await dashboardDB.queryRow<any>(query, 
        input.title,
        input.message,
        input.severity,
        input.category,
        input.schoolId,
        input.userId
      );

      if (!result) {
        throw new Error('Failed to create alert');
      }

      return {
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      };
    }),

  // Real-time KPI updates subscription (placeholder)
  onKPIUpdate: protectedProcedure
    .input(z.object({
      schoolId: z.number().optional(),
      category: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // Placeholder for subscription - will be implemented later
      return { message: 'Subscription placeholder' };
    }),
});