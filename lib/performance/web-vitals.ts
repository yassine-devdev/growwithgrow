// Core Web Vitals monitoring and optimization
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

export interface WebVitalsMetrics {
  CLS: number | null; // Cumulative Layout Shift
  FID: number | null; // First Input Delay
  FCP: number | null; // First Contentful Paint
  LCP: number | null; // Largest Contentful Paint
  TTFB: number | null; // Time to First Byte
}

export interface WebVitalsThresholds {
  CLS: { good: number; needsImprovement: number };
  FID: { good: number; needsImprovement: number };
  FCP: { good: number; needsImprovement: number };
  LCP: { good: number; needsImprovement: number };
  TTFB: { good: number; needsImprovement: number };
}

// Standard Web Vitals thresholds
export const WEB_VITALS_THRESHOLDS: WebVitalsThresholds = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 }
};

export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export class WebVitalsMonitor {
  private metrics: WebVitalsMetrics = {
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null
  };

  private listeners: Array<(metrics: WebVitalsMetrics) => void> = [];
  private analyticsCallback?: (metric: Metric) => void;

  constructor(analyticsCallback?: (metric: Metric) => void) {
    this.analyticsCallback = analyticsCallback;
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // Monitor Cumulative Layout Shift
    getCLS((metric) => {
      this.metrics.CLS = metric.value;
      this.handleMetric(metric);
      this.notifyListeners();
    });

    // Monitor First Input Delay
    getFID((metric) => {
      this.metrics.FID = metric.value;
      this.handleMetric(metric);
      this.notifyListeners();
    });

    // Monitor First Contentful Paint
    getFCP((metric) => {
      this.metrics.FCP = metric.value;
      this.handleMetric(metric);
      this.notifyListeners();
    });

    // Monitor Largest Contentful Paint
    getLCP((metric) => {
      this.metrics.LCP = metric.value;
      this.handleMetric(metric);
      this.notifyListeners();
    });

    // Monitor Time to First Byte
    getTTFB((metric) => {
      this.metrics.TTFB = metric.value;
      this.handleMetric(metric);
      this.notifyListeners();
    });
  }

  private handleMetric(metric: Metric): void {
    // Send to analytics
    this.analyticsCallback?.(metric);

    // Log performance issues
    const rating = this.getMetricRating(metric.name as keyof WebVitalsMetrics, metric.value);
    if (rating === 'poor') {
      console.warn(`Poor ${metric.name} score:`, metric.value, metric);
    }

    // Send to monitoring service
    this.sendToMonitoring(metric);
  }

  private sendToMonitoring(metric: Metric): void {
    // Send to your monitoring service (e.g., Google Analytics, custom endpoint)
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true
      });
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: this.getMetricRating(metric.name as keyof WebVitalsMetrics, metric.value),
        id: metric.id,
        delta: metric.delta,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        connectionType: (navigator as any).connection?.effectiveType
      })
    }).catch(error => {
      console.error('Failed to send Web Vitals data:', error);
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.metrics));
  }

  // Get current metrics
  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  // Get metric rating
  getMetricRating(metricName: keyof WebVitalsMetrics, value: number): MetricRating {
    const thresholds = WEB_VITALS_THRESHOLDS[metricName];
    
    if (value <= thresholds.good) {
      return 'good';
    } else if (value <= thresholds.needsImprovement) {
      return 'needs-improvement';
    } else {
      return 'poor';
    }
  }

  // Get overall performance score
  getPerformanceScore(): {
    score: number;
    rating: MetricRating;
    breakdown: Record<keyof WebVitalsMetrics, { value: number | null; rating: MetricRating }>;
  } {
    const breakdown: Record<keyof WebVitalsMetrics, { value: number | null; rating: MetricRating }> = {} as any;
    let totalScore = 0;
    let validMetrics = 0;

    (Object.keys(this.metrics) as Array<keyof WebVitalsMetrics>).forEach(key => {
      const value = this.metrics[key];
      if (value !== null) {
        const rating = this.getMetricRating(key, value);
        breakdown[key] = { value, rating };
        
        // Convert rating to score (good: 100, needs-improvement: 50, poor: 0)
        const score = rating === 'good' ? 100 : rating === 'needs-improvement' ? 50 : 0;
        totalScore += score;
        validMetrics++;
      } else {
        breakdown[key] = { value: null, rating: 'good' };
      }
    });

    const averageScore = validMetrics > 0 ? totalScore / validMetrics : 0;
    const overallRating: MetricRating = 
      averageScore >= 80 ? 'good' : 
      averageScore >= 50 ? 'needs-improvement' : 'poor';

    return {
      score: Math.round(averageScore),
      rating: overallRating,
      breakdown
    };
  }

  // Add listener for metric updates
  addListener(callback: (metrics: WebVitalsMetrics) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get performance recommendations
  getRecommendations(): Array<{
    metric: keyof WebVitalsMetrics;
    issue: string;
    recommendations: string[];
  }> {
    const recommendations: Array<{
      metric: keyof WebVitalsMetrics;
      issue: string;
      recommendations: string[];
    }> = [];

    // CLS recommendations
    if (this.metrics.CLS !== null && this.getMetricRating('CLS', this.metrics.CLS) !== 'good') {
      recommendations.push({
        metric: 'CLS',
        issue: 'High Cumulative Layout Shift detected',
        recommendations: [
          'Add size attributes to images and videos',
          'Reserve space for ads and embeds',
          'Avoid inserting content above existing content',
          'Use CSS aspect-ratio for responsive images',
          'Preload fonts to prevent font swap'
        ]
      });
    }

    // FID recommendations
    if (this.metrics.FID !== null && this.getMetricRating('FID', this.metrics.FID) !== 'good') {
      recommendations.push({
        metric: 'FID',
        issue: 'High First Input Delay detected',
        recommendations: [
          'Reduce JavaScript execution time',
          'Break up long tasks',
          'Use web workers for heavy computations',
          'Implement code splitting',
          'Remove unused JavaScript'
        ]
      });
    }

    // LCP recommendations
    if (this.metrics.LCP !== null && this.getMetricRating('LCP', this.metrics.LCP) !== 'good') {
      recommendations.push({
        metric: 'LCP',
        issue: 'Slow Largest Contentful Paint detected',
        recommendations: [
          'Optimize images and use modern formats (WebP, AVIF)',
          'Preload important resources',
          'Reduce server response times',
          'Use a CDN',
          'Remove render-blocking resources'
        ]
      });
    }

    // FCP recommendations
    if (this.metrics.FCP !== null && this.getMetricRating('FCP', this.metrics.FCP) !== 'good') {
      recommendations.push({
        metric: 'FCP',
        issue: 'Slow First Contentful Paint detected',
        recommendations: [
          'Eliminate render-blocking resources',
          'Minify CSS and JavaScript',
          'Remove unused CSS',
          'Use efficient cache policies',
          'Minimize critical request depth'
        ]
      });
    }

    // TTFB recommendations
    if (this.metrics.TTFB !== null && this.getMetricRating('TTFB', this.metrics.TTFB) !== 'good') {
      recommendations.push({
        metric: 'TTFB',
        issue: 'Slow Time to First Byte detected',
        recommendations: [
          'Optimize server performance',
          'Use a CDN',
          'Implement server-side caching',
          'Optimize database queries',
          'Use HTTP/2 or HTTP/3'
        ]
      });
    }

    return recommendations;
  }
}

// Performance optimization utilities
export class PerformanceOptimizer {
  // Optimize images for better LCP
  static optimizeImages(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" for non-critical images
      if (!img.hasAttribute('loading') && !this.isCriticalImage(img)) {
        img.setAttribute('loading', 'lazy');
      }

      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  private static isCriticalImage(img: HTMLImageElement): boolean {
    const rect = img.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.left < window.innerWidth;
  }

  // Preload critical resources
  static preloadCriticalResources(resources: Array<{ href: string; as: string; type?: string }>): void {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      document.head.appendChild(link);
    });
  }

  // Reduce layout shifts
  static reduceLayoutShifts(): void {
    // Add aspect ratio to images without dimensions
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      img.addEventListener('load', () => {
        if (!img.style.aspectRatio) {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          img.style.aspectRatio = aspectRatio.toString();
        }
      });
    });

    // Reserve space for dynamic content
    const dynamicContainers = document.querySelectorAll('[data-dynamic-content]');
    dynamicContainers.forEach(container => {
      if (!container.getAttribute('style')?.includes('min-height')) {
        (container as HTMLElement).style.minHeight = '100px';
      }
    });
  }

  // Optimize fonts
  static optimizeFonts(): void {
    // Add font-display: swap to font faces
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap;
      }
    `;
    document.head.appendChild(style);

    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-regular.woff2',
      '/fonts/inter-medium.woff2'
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Optimize JavaScript execution
  static optimizeJavaScript(): void {
    // Use requestIdleCallback for non-critical tasks
    if ('requestIdleCallback' in window) {
      const nonCriticalTasks: Array<() => void> = [];
      
      (window as any).scheduleNonCriticalTask = (task: () => void) => {
        nonCriticalTasks.push(task);
      };

      const runNonCriticalTasks = (deadline: IdleDeadline) => {
        while (deadline.timeRemaining() > 0 && nonCriticalTasks.length > 0) {
          const task = nonCriticalTasks.shift();
          task?.();
        }
        
        if (nonCriticalTasks.length > 0) {
          requestIdleCallback(runNonCriticalTasks);
        }
      };

      requestIdleCallback(runNonCriticalTasks);
    }
  }
}

// React hook for Web Vitals monitoring
export function useWebVitals(callback?: (metrics: WebVitalsMetrics) => void) {
  const [metrics, setMetrics] = React.useState<WebVitalsMetrics>({
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null
  });

  const [monitor] = React.useState(() => new WebVitalsMonitor());

  React.useEffect(() => {
    const unsubscribe = monitor.addListener((newMetrics) => {
      setMetrics(newMetrics);
      callback?.(newMetrics);
    });

    return unsubscribe;
  }, [monitor, callback]);

  return {
    metrics,
    performanceScore: monitor.getPerformanceScore(),
    recommendations: monitor.getRecommendations()
  };
}

// Initialize Web Vitals monitoring
export function initializeWebVitalsMonitoring(
  analyticsCallback?: (metric: Metric) => void
): WebVitalsMonitor {
  const monitor = new WebVitalsMonitor(analyticsCallback);
  
  // Apply performance optimizations
  PerformanceOptimizer.optimizeImages();
  PerformanceOptimizer.reduceLayoutShifts();
  PerformanceOptimizer.optimizeFonts();
  PerformanceOptimizer.optimizeJavaScript();
  
  console.log('Web Vitals monitoring initialized');
  return monitor;
}

// Export singleton instance
export const webVitalsMonitor = new WebVitalsMonitor();