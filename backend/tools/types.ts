export interface Report {
    id: number;
    name: string;
    description?: string;
    reportType: 'academic' | 'financial' | 'attendance' | 'behavior' | 'custom';
    queryConfig: any;
    chartConfig?: any;
    filters?: any;
    schedule?: any;
    isPublic: boolean;
    isActive: boolean;
    createdBy: number;
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface MarketingCampaign {
    id: number;
    name: string;
    description?: string;
    campaignType: 'email' | 'sms' | 'social' | 'seo' | 'ads' | 'content';
    status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
    targetAudience?: any;
    content?: any;
    settings?: any;
    metrics?: any;
    budget?: number;
    startDate?: Date;
    endDate?: Date;
    createdBy: number;
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface SEOData {
    id: number;
    url: string;
    title?: string;
    metaDescription?: string;
    keywords?: string[];
    h1Tags?: string[];
    h2Tags?: string[];
    internalLinks: number;
    externalLinks: number;
    imagesCount: number;
    imagesWithoutAlt: number;
    pageSpeedScore?: number;
    mobileFriendly: boolean;
    sslEnabled: boolean;
    crawlDate: Date;
    schoolId?: number;
    createdAt: Date;
  }
  
  export interface AnalyticsData {
    id: number;
    metricName: string;
    metricValue: number;
    dimensions?: any;
    date: Date;
    hour?: number;
    source?: string;
    schoolId?: number;
    createdAt: Date;
  }
  