// Frontend analytics client for tracking user interactions
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export interface AnalyticsConfig {
  apiEndpoint: string;
  sessionId?: string;
  userId?: string;
  debug?: boolean;
}

export class AnalyticsClient {
  private config: AnalyticsConfig;
  private queue: AnalyticsEvent[] = [];
  private isOnline: boolean = navigator.onLine;
  private flushTimer?: NodeJS.Timeout;

  constructor(config: AnalyticsConfig) {
    this.config = {
      debug: false,
      ...config
    };

    this.setupEventListeners();
    this.startAutoFlush();
  }

  private setupEventListeners() {
    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flush();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.flush(true); // Synchronous flush
    });
  }

  private startAutoFlush() {
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, 10000); // Flush every 10 seconds
  }

  // Track custom events
  track(eventName: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    this.queue.push(event);

    if (this.config.debug) {
      console.log('Analytics event tracked:', event);
    }

    // Flush immediately for important events
    if (this.isImportantEvent(eventName)) {
      this.flush();
    }
  }

  // Track page views
  trackPageView(page?: string, title?: string): void {
    this.track('page_view', {
      page: page || window.location.pathname,
      title: title || document.title,
      search: window.location.search,
      hash: window.location.hash
    });
  }

  // Track clicks
  trackClick(element: string, properties: Record<string, any> = {}): void {
    this.track('click', {
      element,
      ...properties
    });
  }

  // Track form submissions
  trackFormSubmit(formName: string, properties: Record<string, any> = {}): void {
    this.track('form_submit', {
      form: formName,
      ...properties
    });
  }

  // Track feature usage
  trackFeatureUsage(featureName: string, properties: Record<string, any> = {}): void {
    this.track('feature_usage', {
      feature: featureName,
      ...properties
    });
  }

  // Track errors
  trackError(error: Error, context: Record<string, any> = {}): void {
    this.track('error', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...context
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.track('performance', {
      metric,
      value,
      unit
    });
  }

  // Track A/B test exposure
  trackABTestExposure(testName: string, variant: string): void {
    this.track('ab_test_exposure', {
      testName,
      variant
    });
  }

  // Track conversions
  trackConversion(conversionType: string, value?: number, currency?: string): void {
    this.track('conversion', {
      type: conversionType,
      value,
      currency
    });
  }

  // Set user ID
  setUserId(userId: string): void {
    this.config.userId = userId;
  }

  // Set session ID
  setSessionId(sessionId: string): void {
    this.config.sessionId = sessionId;
  }

  // Flush events to server
  private async flush(synchronous: boolean = false): Promise<void> {
    if (this.queue.length === 0 || (!this.isOnline && !synchronous)) {
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    const payload = {
      events,
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    try {
      if (synchronous) {
        // Use sendBeacon for synchronous requests (page unload)
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(`${this.config.apiEndpoint}/analytics/events`, blob);
      } else {
        // Use fetch for asynchronous requests
        await fetch(`${this.config.apiEndpoint}/analytics/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      if (this.config.debug) {
        console.log('Analytics events flushed:', events.length);
      }
    } catch (error) {
      // Re-queue events if request failed
      this.queue.unshift(...events);
      
      if (this.config.debug) {
        console.error('Failed to flush analytics events:', error);
      }
    }
  }

  private isImportantEvent(eventName: string): boolean {
    const importantEvents = [
      'user_registration',
      'user_login',
      'subscription_created',
      'payment_completed',
      'error'
    ];
    return importantEvents.includes(eventName);
  }

  // Clean up
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(true);
  }
}

// Auto-tracking utilities
export class AutoTracker {
  private analytics: AnalyticsClient;

  constructor(analytics: AnalyticsClient) {
    this.analytics = analytics;
  }

  // Auto-track all clicks
  trackClicks(selector: string = 'button, a, [data-track]'): void {
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      const element = target.closest(selector);
      
      if (element) {
        const trackingData = element.getAttribute('data-track');
        const elementName = element.getAttribute('data-track-name') || 
                           element.textContent?.trim() || 
                           element.tagName.toLowerCase();
        
        this.analytics.trackClick(elementName, {
          selector: this.getElementSelector(element),
          trackingData: trackingData ? JSON.parse(trackingData) : undefined
        });
      }
    });
  }

  // Auto-track form submissions
  trackForms(selector: string = 'form'): void {
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      
      if (form.matches(selector)) {
        const formName = form.getAttribute('data-track-name') || 
                        form.getAttribute('name') || 
                        form.id || 
                        'unnamed_form';
        
        this.analytics.trackFormSubmit(formName, {
          action: form.action,
          method: form.method
        });
      }
    });
  }

  // Auto-track scroll depth
  trackScrollDepth(): void {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 100];
    const tracked = new Set<number>();

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !tracked.has(milestone)) {
            tracked.add(milestone);
            this.analytics.track('scroll_depth', {
              depth: milestone,
              page: window.location.pathname
            });
          }
        });
      }
    });
  }

  // Auto-track time on page
  trackTimeOnPage(): void {
    const startTime = Date.now();
    let isActive = true;
    let totalActiveTime = 0;
    let lastActiveTime = startTime;

    // Track when user becomes active/inactive
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const onActivity = () => {
      if (!isActive) {
        isActive = true;
        lastActiveTime = Date.now();
      }
    };

    const onInactivity = () => {
      if (isActive) {
        totalActiveTime += Date.now() - lastActiveTime;
        isActive = false;
      }
    };

    events.forEach(event => {
      document.addEventListener(event, onActivity, true);
    });

    // Consider user inactive after 30 seconds of no activity
    let inactivityTimer: NodeJS.Timeout;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(onInactivity, 30000);
    };

    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Track time when page unloads
    window.addEventListener('beforeunload', () => {
      if (isActive) {
        totalActiveTime += Date.now() - lastActiveTime;
      }
      
      this.analytics.track('time_on_page', {
        totalTime: Date.now() - startTime,
        activeTime: totalActiveTime,
        page: window.location.pathname
      });
    });
  }

  private getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }
}

// Performance tracking utilities
export class PerformanceTracker {
  private analytics: AnalyticsClient;

  constructor(analytics: AnalyticsClient) {
    this.analytics = analytics;
  }

  // Track Core Web Vitals
  trackWebVitals(): void {
    // Track when performance data is available
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.analytics.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
          this.analytics.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          this.analytics.trackPerformance('first_byte', navigation.responseStart - navigation.fetchStart);
        }
      }, 0);
    });

    // Track Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.analytics.trackPerformance('largest_contentful_paint', lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  // Track resource loading times
  trackResourceTiming(): void {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      
      resources.forEach((resource: PerformanceResourceTiming) => {
        if (resource.duration > 100) { // Only track slow resources
          this.analytics.trackPerformance('resource_load_time', resource.duration, 'ms');
        }
      });
    });
  }
}

// Create and export default instance
let defaultAnalytics: AnalyticsClient | null = null;

export function initializeAnalytics(config: AnalyticsConfig): AnalyticsClient {
  defaultAnalytics = new AnalyticsClient(config);
  return defaultAnalytics;
}

export function getAnalytics(): AnalyticsClient | null {
  return defaultAnalytics;
}