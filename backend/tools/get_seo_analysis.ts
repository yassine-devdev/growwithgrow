import { api } from "encore.dev/api";
import { toolsDB } from "./db";
import type { SEOData } from "./types";

export interface GetSEOAnalysisRequest {
  url?: string;
  schoolId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface GetSEOAnalysisResponse {
  seoData: SEOData[];
  total: number;
  summary: {
    averagePageSpeed: number;
    mobileFriendlyPercentage: number;
    sslEnabledPercentage: number;
    averageInternalLinks: number;
    averageExternalLinks: number;
  };
}

// Retrieves SEO analysis data.
export const getSEOAnalysis = api<GetSEOAnalysisRequest, GetSEOAnalysisResponse>(
  { expose: true, method: "GET", path: "/tools/seo/analysis" },
  async (req) => {
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (req.url) {
      whereClause += ` AND url LIKE $${paramIndex}`;
      params.push(`%${req.url}%`);
      paramIndex++;
    }

    if (req.schoolId) {
      whereClause += ` AND school_id = $${paramIndex}`;
      params.push(req.schoolId);
      paramIndex++;
    }

    if (req.startDate) {
      whereClause += ` AND crawl_date >= $${paramIndex}`;
      params.push(req.startDate);
      paramIndex++;
    }

    if (req.endDate) {
      whereClause += ` AND crawl_date <= $${paramIndex}`;
      params.push(req.endDate);
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM seo_data
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        id,
        url,
        title,
        meta_description as "metaDescription",
        keywords,
        h1_tags as "h1Tags",
        h2_tags as "h2Tags",
        internal_links as "internalLinks",
        external_links as "externalLinks",
        images_count as "imagesCount",
        images_without_alt as "imagesWithoutAlt",
        page_speed_score as "pageSpeedScore",
        mobile_friendly as "mobileFriendly",
        ssl_enabled as "sslEnabled",
        crawl_date as "crawlDate",
        school_id as "schoolId",
        created_at as "createdAt"
      FROM seo_data
      ${whereClause}
      ORDER BY crawl_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const summaryQuery = `
      SELECT 
        AVG(page_speed_score) as avg_page_speed,
        AVG(CASE WHEN mobile_friendly THEN 1 ELSE 0 END) * 100 as mobile_friendly_pct,
        AVG(CASE WHEN ssl_enabled THEN 1 ELSE 0 END) * 100 as ssl_enabled_pct,
        AVG(internal_links) as avg_internal_links,
        AVG(external_links) as avg_external_links
      FROM seo_data
      ${whereClause}
    `;

    const countResult = await toolsDB.queryRow<{ total: number }>(countQuery, ...params.slice(0, paramIndex - 2));
    const seoData = await toolsDB.queryAll<SEOData>(dataQuery, ...params, limit, offset);
    const summaryResult = await toolsDB.queryRow<{
      avg_page_speed: number;
      mobile_friendly_pct: number;
      ssl_enabled_pct: number;
      avg_internal_links: number;
      avg_external_links: number;
    }>(summaryQuery, ...params.slice(0, paramIndex - 2));

    return {
      seoData,
      total: countResult?.total || 0,
      summary: {
        averagePageSpeed: summaryResult?.avg_page_speed || 0,
        mobileFriendlyPercentage: summaryResult?.mobile_friendly_pct || 0,
        sslEnabledPercentage: summaryResult?.ssl_enabled_pct || 0,
        averageInternalLinks: summaryResult?.avg_internal_links || 0,
        averageExternalLinks: summaryResult?.avg_external_links || 0
      }
    };
  }
);
