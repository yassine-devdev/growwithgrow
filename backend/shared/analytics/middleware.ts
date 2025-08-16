import { Request, Response, NextFunction } from 'express';
import { analyticsTracker } from './tracker.js';
import { nanoid } from 'nanoid';

export interface AnalyticsRequest extends Request {
  sessionId?: string;
  analytics?: {
    trackEvent: (eventName: string, properties?: Record<string, any>) => Promise<void>;
    trackFeatureUsage: (featureName: string, options?: {
      duration?: number;
      success?: boolean;
      metadata?: Record<string, any>;
    }) => Promise<void>;
    assignABTest: (testName: string) => string;
    trackConversion: (testName: string, conversionEvent: string) => Promise<void>;
  };
}

// Session management middleware
export function sessionMiddleware(req: AnalyticsRequest, res: Response, next: NextFunction) {
  // Get or create session ID
  let sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;
  
  if (!sessionId) {
    sessionId = nanoid();
    res.cookie('sessionId', sessionId, {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }
  
  req.sessionId = sessionId;
  
  // Start session if it's a new session
  if (!req.cookies?.sessionId) {
    analyticsTracker.startSession(sessionId, {
      userId: req.user?.id,
      userAgent: req.get('User-Agent') || '',
      ip: req.ip || req.connection.remoteAddress || '',
      country: req.headers['cf-ipcountry'] as string, // Cloudflare header
      city: req.headers['cf-ipcity'] as string
    }).catch(error => {
      console.error('Failed to start analytics session:', error);
    });
  }
  
  next();
}

// Analytics tracking middleware
export function analyticsMiddleware(req: AnalyticsRequest, res: Response, next: NextFunction) {
  if (!req.sessionId) {
    return next();
  }
  
  // Add analytics helper methods to request
  req.analytics = {
    trackEvent: async (eventName: string, properties: Record<string, any> = {}) => {
      await analyticsTracker.trackEvent(eventName, properties, {
        userId: req.user?.id,
        sessionId: req.sessionId!,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referrer: req.get('Referer'),
        url: req.originalUrl
      });
    },
    
    trackFeatureUsage: async (featureName: string, options: {
      duration?: number;
      success?: boolean;
      metadata?: Record<string, any>;
    } = {}) => {
      await analyticsTracker.trackFeatureUsage(featureName, {
        userId: req.user?.id,
        sessionId: req.sessionId!,
        duration: options.duration,
        success: options.success ?? true,
        metadata: options.metadata
      });
    },
    
    assignABTest: (testName: string) => {
      if (!req.user?.id) {
        return 'control'; // Default for anonymous users
      }
      return analyticsTracker.assignABTestVariant(testName, req.user.id);
    },
    
    trackConversion: async (testName: string, conversionEvent: string) => {
      if (req.user?.id) {
        await analyticsTracker.trackABTestConversion(testName, req.user.id, conversionEvent);
      }
    }
  };
  
  next();
}

// Auto-track page views for GET requests
export function pageViewTrackingMiddleware(req: AnalyticsRequest, res: Response, next: NextFunction) {
  if (req.method === 'GET' && req.analytics && !req.path.startsWith('/api/')) {
    req.analytics.trackEvent('page_view', {
      path: req.path,
      query: req.query,
      referrer: req.get('Referer')
    }).catch(error => {
      console.error('Failed to track page view:', error);
    });
  }
  
  next();
}

// Track API endpoint usage
export function apiUsageTrackingMiddleware(req: AnalyticsRequest, res: Response, next: NextFunction) {
  if (req.path.startsWith('/api/') && req.analytics) {
    const startTime = Date.now();
    
    // Track API call
    req.analytics.trackEvent('api_call', {
      endpoint: req.path,
      method: req.method,
      authenticated: !!req.user
    }).catch(error => {
      console.error('Failed to track API call:', error);
    });
    
    // Track response when request completes
    const originalSend = res.send;
    res.send = function(data: any) {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      req.analytics?.trackFeatureUsage(`api_${req.path.replace(/\//g, '_')}`, {
        duration,
        success,
        metadata: {
          method: req.method,
          statusCode: res.statusCode,
          responseSize: data ? data.length : 0
        }
      }).catch(error => {
        console.error('Failed to track API usage:', error);
      });
      
      return originalSend.call(this, data);
    };
  }
  
  next();
}

// Track user authentication events
export function authTrackingMiddleware(req: AnalyticsRequest, res: Response, next: NextFunction) {
  // This would be called after authentication middleware
  if (req.user && req.analytics) {
    // Check if this is a new login (you'd implement this logic based on your auth system)
    const isNewLogin = req.headers['x-new-login'] === 'true';
    
    if (isNewLogin) {
      req.analytics.trackEvent('user_login', {
        userId: req.user.id,
        method: req.headers['x-auth-method'] || 'password',
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }).catch(error => {
        console.error('Failed to track login:', error);
      });
    }
  }
  
  next();
}

// Track feature flags and A/B tests
export function featureFlagMiddleware(req: AnalyticsRequest, res: Response, next: NextFunction) {
  if (req.user && req.analytics) {
    // Add feature flag assignments to response headers for frontend
    const dashboardLayout = req.analytics.assignABTest('dashboard_layout');
    const chatInterface = req.analytics.assignABTest('ai_chat_interface');
    
    res.setHeader('X-AB-Dashboard-Layout', dashboardLayout);
    res.setHeader('X-AB-Chat-Interface', chatInterface);
    
    // Track A/B test exposure
    req.analytics.trackEvent('ab_test_exposure', {
      tests: {
        dashboard_layout: dashboardLayout,
        ai_chat_interface: chatInterface
      }
    }).catch(error => {
      console.error('Failed to track A/B test exposure:', error);
    });
  }
  
  next();
}

// Clean up sessions on logout or session end
export function sessionCleanupMiddleware(req: AnalyticsRequest, res: Response, next: NextFunction) {
  // This would be called on logout endpoints
  if (req.sessionId && req.path.includes('/logout')) {
    analyticsTracker.endSession(req.sessionId).catch(error => {
      console.error('Failed to end analytics session:', error);
    });
    
    // Clear session cookie
    res.clearCookie('sessionId');
  }
  
  next();
}

// Error tracking middleware
export function errorTrackingMiddleware(error: Error, req: AnalyticsRequest, res: Response, next: NextFunction) {
  if (req.analytics) {
    req.analytics.trackEvent('error', {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      userId: req.user?.id
    }).catch(trackingError => {
      console.error('Failed to track error:', trackingError);
    });
  }
  
  next(error);
}

// Business event tracking helpers
export const BusinessEventTracking = {
  // Track user registration
  trackRegistration: async (req: AnalyticsRequest, userData: {
    userId: string;
    email: string;
    source: string;
    planType: string;
  }) => {
    if (req.analytics) {
      await req.analytics.trackEvent('user_registration', {
        userId: userData.userId,
        email: userData.email,
        source: userData.source,
        planType: userData.planType,
        timestamp: new Date().toISOString()
      });
      
      // Track conversion if user came from a marketing campaign
      if (req.query.utm_campaign) {
        await req.analytics.trackConversion('registration_campaign', 'user_registered');
      }
    }
  },
  
  // Track subscription events
  trackSubscription: async (req: AnalyticsRequest, subscriptionData: {
    userId: string;
    planType: string;
    amount: number;
    currency: string;
    billingCycle: string;
  }) => {
    if (req.analytics) {
      await req.analytics.trackEvent('subscription_created', subscriptionData);
      await req.analytics.trackConversion('pricing_page', 'subscription_created');
    }
  },
  
  // Track AI usage
  trackAIUsage: async (req: AnalyticsRequest, aiData: {
    provider: string;
    model: string;
    operation: string;
    tokens: number;
    cost: number;
    success: boolean;
  }) => {
    if (req.analytics) {
      await req.analytics.trackFeatureUsage(`ai_${aiData.provider}_${aiData.model}`, {
        success: aiData.success,
        metadata: {
          operation: aiData.operation,
          tokens: aiData.tokens,
          cost: aiData.cost
        }
      });
    }
  },
  
  // Track feature adoption
  trackFeatureAdoption: async (req: AnalyticsRequest, featureName: string, adopted: boolean) => {
    if (req.analytics) {
      await req.analytics.trackEvent('feature_adoption', {
        feature: featureName,
        adopted,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
    }
  }
};