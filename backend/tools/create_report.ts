import { api } from "encore.dev/api";
import { toolsDB } from "./db";
import type { Report } from "./types";

export interface CreateReportRequest {
  name: string;
  description?: string;
  reportType: 'academic' | 'financial' | 'attendance' | 'behavior' | 'custom';
  queryConfig: any;
  chartConfig?: any;
  filters?: any;
  schedule?: any;
  isPublic?: boolean;
  createdBy: number;
  schoolId?: number;
}

// Creates a new report.
export const createReport = api<CreateReportRequest, Report>(
  { expose: true, method: "POST", path: "/tools/reports" },
  async (req) => {
    const report = await toolsDB.queryRow<Report>`
      INSERT INTO reports (
        name, description, report_type, query_config, chart_config,
        filters, schedule, is_public, created_by, school_id
      )
      VALUES (
        ${req.name}, ${req.description}, ${req.reportType}, ${req.queryConfig},
        ${req.chartConfig}, ${req.filters}, ${req.schedule}, ${req.isPublic || false},
        ${req.createdBy}, ${req.schoolId}
      )
      RETURNING 
        id,
        name,
        description,
        report_type as "reportType",
        query_config as "queryConfig",
        chart_config as "chartConfig",
        filters,
        schedule,
        is_public as "isPublic",
        is_active as "isActive",
        created_by as "createdBy",
        school_id as "schoolId",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return report!;
  }
);
