import { createLogger } from '../monitoring/logger.js';
import { BusinessMetrics } from '../monitoring/middleware.js';

const logger = createLogger(undefined, undefined, 'analytics');

export interface UserEvent {
  eventId: string;
  userId?: string;
  sessionId: string;
  eventName: string;
  eventType: 'page_view' | 'click' | 'form_submit' | 'feature_use' | 'custom';
  timestamp: string;
  properties: Record<string, any>;
  userAgent?: string;
  ip?: string;
  referrer?: string;
  url?: string;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  events: number;
  userAgent: string;
  ip: string;
  country?: string;
  city?: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
}

export interface FeatureUsage {
  featureName: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
  duration?: number;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface ABTestVariant {
  testName: string;
  variantName: string;
  userId: string;
  assignedAt: string;
  convertedAt?: string;
  conversionEvent?: string;
}

// Analytics storage interface (can be implemented with different backends)
export interface AnalyticsStorage {
  storeEvent(event: UserEvent): Promise<void>;
  storeSession(session: UserSession): Promise<void>;
  storeFeatureUsage(usage: FeatureUsage): Promise<void>;
  storeABTestAssignment(assignment: ABTestVariant): Promise<void>;
  getEvents(filters: any): Promise<UserEvent[]>;
  getSessions(filters: any): Promise<UserSession[]>;
  getFeatureUsage(filters: any): Promise<FeatureUsage[]>;
  getABTestResults(testName: string): Promise<ABTestVariant[]>;
}

// In-memory storage implementation (for development/testing)
export class InMemoryAnalyticsStorage implements AnalyticsStorage {
  private events: UserEvent[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private featureUsage: FeatureUsage[] = [];
  private abTestAssignments: ABTestVariant[] = [];

  async storeEvent(event: UserEvent): Promise<void> {
    this.events.push(event);
    
    // Update session event count
    const session = this.sessions.get(event.sessionId);
    if (session) {
      session.events++;
      if (event.eventType === 'page_view') {
        session.pageViews++;
      }
    }
  }

  async storeSession(session: UserSession): Promise<void> {
    this.sessions.set(session.sessionId, session);
  }

  async storeFeatureUsage(usage: FeatureUsage): Promise<void> {
    this.featureUsage.push(usage);
  }

  async storeABTestAssignment(assignment: ABTestVariant): Promise<void> {
    this.abTestAssignments.push(assignment);
  }

  async getEvents(filters: any): Promise<UserEvent[]> {
    let filtered = this.events;
    
    if (filters.userId) {
      filtered = filtered.filter(e => e.userId === filters.userId);
    }
    
    if (filters.eventName) {
      filtered = filtered.filter(e => e.eventName === filters.eventName);
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filters.startDate);
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filters.endDate);
    }
    
    return filtered.slice(0, filters.limit || 1000);
  }

  async getSessions(filters: any): Promise<UserSession[]> {
    let filtered = Array.from(this.sessions.values());
    
    if (filters.userId) {
      filtered = filtered.filter(s => s.userId === filters.userId);
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(s => s.startTime >= filters.startDate);
    }
    
    return filtered.slice(0, filters.limit || 1000);
  }

  async getFeatureUsage(filters: any): Promise<FeatureUsage[]> {
    let filtered = this.featureUsage;
    
    if (filters.featureName) {
      filtered = filtered.filter(f => f.featureName === filters.featureName);
    }
    
    if (filters.userId) {
      filtered = filtered.filter(f => f.userId === filters.userId);
    }
    
    return filtered.slice(0, filters.limit || 1000);
  }

  async getABTestResults(testName: string): Promise<ABTestVariant[]> {
    return this.abTestAssignments.filter(a => a.testName === testName);
  }
}

// Main analytics tracker class
export class AnalyticsTracker {
  private storage: AnalyticsStorage;
  private sessions: Map<string, UserSession> = new Map();
  private abTests: Map<string, { variants: string[]; weights: number[] }> = new Map();

  constructor(storage?: AnalyticsStorage) {
    this.storage = storage || new InMemoryAnalyticsStorage();
    this.setupDefaultABTests();
  }

  private setupDefaultABTests() {
    // Example A/B tests
    this.abTests.set('dashboard_layout', {
      variants: ['classic', 'modern', 'compact'],
      weights: [0.4, 0.4, 0.2]
    });
    
    this.abTests.set('ai_chat_interface', {
      variants: ['sidebar', 'modal', 'fullscreen'],
      weights: [0.5, 0.3, 0.2]
    });
  }

  // Track user events
  async trackEvent(
    eventName: string,
    properties: Record<string, any> = {},
    context: {
      userId?: string;
      sessionId: string;
      userAgent?: string;
      ip?: string;
      referrer?: string;
      url?: string;
    }
  ): Promise<void> {
    const event: UserEvent = {
      eventId: this.generateId(),
      userId: context.userId,
      sessionId: context.sessionId,
      eventName,
      eventType: this.inferEventType(eventName),
      timestamp: new Date().toISOString(),
      properties,
      userAgent: context.userAgent,
      ip: context.ip,
      referrer: context.referrer,
      url: context.url
    };

    await this.storage.storeEvent(event);
    
    // Update Prometheus metrics
    BusinessMetrics.recordFeatureUsage(eventName, context.userId ? 'authenticated' : 'anonymous');
    
    logger.debug('Event tracked', {
      eventName,
      userId: context.userId,
      sessionId: context.sessionId
    });
  }

  // Track page views
  async trackPageView(
    page: string,
    context: {
      userId?: string;
      sessionId: string;
      userAgent?: string;
      ip?: string;
      referrer?: string;
      title?: string;
    }
  ): Promise<void> {
    await this.trackEvent('page_view', {
      page,
      title: context.title
    }, context);
  }

  // Track feature usage
  async trackFeatureUsage(
    featureName: string,
    context: {
      userId?: string;
      sessionId: string;
      duration?: number;
      success: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const usage: FeatureUsage = {
      featureName,
      userId: context.userId,
      sessionId: context.sessionId,
      timestamp: new Date().toISOString(),
      duration: context.duration,
      success: context.success,
      metadata: context.metadata
    };

    await this.storage.storeFeatureUsage(usage);
    
    // Track as event as well
    await this.trackEvent(`feature_${featureName}`, {
      duration: context.duration,
      success: context.success,
      ...context.metadata
    }, { userId: context.userId, sessionId: context.sessionId });
  }

  // Start user session
  async startSession(
    sessionId: string,
    context: {
      userId?: string;
      userAgent: string;
      ip: string;
      country?: string;
      city?: string;
    }
  ): Promise<void> {
    const device = this.parseUserAgent(context.userAgent);
    
    const session: UserSession = {
      sessionId,
      userId: context.userId,
      startTime: new Date().toISOString(),
      pageViews: 0,
      events: 0,
      userAgent: context.userAgent,
      ip: context.ip,
      country: context.country,
      city: context.city,
      device
    };

    this.sessions.set(sessionId, session);
    await this.storage.storeSession(session);
    
    logger.debug('Session started', {
      sessionId,
      userId: context.userId,
      device: device.type
    });
  }

  // End user session
  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const endTime = new Date().toISOString();
    const duration = Date.parse(endTime) - Date.parse(session.startTime);
    
    session.endTime = endTime;
    session.duration = duration;
    
    await this.storage.storeSession(session);
    this.sessions.delete(sessionId);
    
    logger.debug('Session ended', {
      sessionId,
      duration: duration / 1000,
      pageViews: session.pageViews,
      events: session.events
    });
  }

  // A/B Testing
  assignABTestVariant(testName: string, userId: string): string {
    const test = this.abTests.get(testName);
    if (!test) {
      logger.warn('A/B test not found', { testName });
      return 'control';
    }

    // Use user ID to ensure consistent assignment
    const hash = this.hashUserId(userId);
    const random = hash % 1000 / 1000; // Convert to 0-1 range
    
    let cumulativeWeight = 0;
    for (let i = 0; i < test.variants.length; i++) {
      cumulativeWeight += test.weights[i];
      if (random <= cumulativeWeight) {
        const variant = test.variants[i];
        
        // Store assignment
        this.storage.storeABTestAssignment({
          testName,
          variantName: variant,
          userId,
          assignedAt: new Date().toISOString()
        });
        
        logger.debug('A/B test variant assigned', {
          testName,
          userId,
          variant
        });
        
        return variant;
      }
    }
    
    return test.variants[0]; // Fallback to first variant
  }

  // Track A/B test conversion
  async trackABTestConversion(
    testName: string,
    userId: string,
    conversionEvent: string
  ): Promise<void> {
    const assignments = await this.storage.getABTestResults(testName);
    const assignment = assignments.find(a => a.userId === userId && !a.convertedAt);
    
    if (assignment) {
      assignment.convertedAt = new Date().toISOString();
      assignment.conversionEvent = conversionEvent;
      
      await this.storage.storeABTestAssignment(assignment);
      
      logger.info('A/B test conversion tracked', {
        testName,
        userId,
        variant: assignment.variantName,
        conversionEvent
      });
    }
  }

  // Analytics queries
  async getUserJourney(userId: string, days: number = 7): Promise<UserEvent[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.storage.getEvents({
      userId,
      startDate: startDate.toISOString(),
      limit: 1000
    });
  }

  async getFeatureAdoption(featureName: string, days: number = 30): Promise<{
    totalUsers: number;
    activeUsers: number;
    adoptionRate: number;
    usageCount: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const usage = await this.storage.getFeatureUsage({
      featureName,
      startDate: startDate.toISOString()
    });
    
    const uniqueUsers = new Set(usage.map(u => u.userId).filter(Boolean));
    const totalEvents = await this.storage.getEvents({
      startDate: startDate.toISOString()
    });
    const totalUniqueUsers = new Set(totalEvents.map(e => e.userId).filter(Boolean));
    
    return {
      totalUsers: totalUniqueUsers.size,
      activeUsers: uniqueUsers.size,
      adoptionRate: totalUniqueUsers.size > 0 ? uniqueUsers.size / totalUniqueUsers.size : 0,
      usageCount: usage.length
    };
  }

  async getABTestResults(testName: string): Promise<{
    variants: Array<{
      name: string;
      users: number;
      conversions: number;
      conversionRate: number;
    }>;
  }> {
    const assignments = await this.storage.getABTestResults(testName);
    const variantStats = new Map<string, { users: number; conversions: number }>();
    
    assignments.forEach(assignment => {
      const stats = variantStats.get(assignment.variantName) || { users: 0, conversions: 0 };
      stats.users++;
      if (assignment.convertedAt) {
        stats.conversions++;
      }
      variantStats.set(assignment.variantName, stats);
    });
    
    const variants = Array.from(variantStats.entries()).map(([name, stats]) => ({
      name,
      users: stats.users,
      conversions: stats.conversions,
      conversionRate: stats.users > 0 ? stats.conversions / stats.users : 0
    }));
    
    return { variants };
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private inferEventType(eventName: string): UserEvent['eventType'] {
    if (eventName === 'page_view') return 'page_view';
    if (eventName.includes('click')) return 'click';
    if (eventName.includes('submit')) return 'form_submit';
    if (eventName.startsWith('feature_')) return 'feature_use';
    return 'custom';
  }

  private parseUserAgent(userAgent: string): UserSession['device'] {
    // Simplified user agent parsing
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);
    
    let type: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (isTablet) type = 'tablet';
    else if (isMobile) type = 'mobile';
    
    let os = 'Unknown';
    if (/Windows/.test(userAgent)) os = 'Windows';
    else if (/Mac/.test(userAgent)) os = 'macOS';
    else if (/Linux/.test(userAgent)) os = 'Linux';
    else if (/Android/.test(userAgent)) os = 'Android';
    else if (/iOS/.test(userAgent)) os = 'iOS';
    
    let browser = 'Unknown';
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Edge/.test(userAgent)) browser = 'Edge';
    
    return { type, os, browser };
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Singleton instance
export const analyticsTracker = new AnalyticsTracker();