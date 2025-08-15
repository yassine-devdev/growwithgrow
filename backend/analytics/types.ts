export interface Event {
    id: number;
    userId?: number;
    sessionId?: string;
    eventName: string;
    eventCategory: string;
    eventAction: string;
    eventLabel?: string;
    eventValue?: number;
    properties?: any;
    pageUrl?: string;
    pageTitle?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
    schoolId?: number;
    createdAt: Date;
  }
  
  export interface PageView {
    id: number;
    userId?: number;
    sessionId: string;
    pageUrl: string;
    pageTitle?: string;
    referrer?: string;
    durationSeconds?: number;
    bounce: boolean;
    userAgent?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
    schoolId?: number;
    createdAt: Date;
  }
  
  export interface UserSession {
    id: number;
    sessionId: string;
    userId?: number;
    startTime: Date;
    endTime?: Date;
    durationSeconds?: number;
    pageViews: number;
    events: number;
    bounce: boolean;
    entryPage?: string;
    exitPage?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    userAgent?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    os?: string;
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  