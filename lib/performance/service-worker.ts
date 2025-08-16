// Service Worker registration and management
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = 'serviceWorker' in navigator;

  constructor() {
    if (this.isSupported) {
      this.register();
    }
  }

  async register(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.showUpdateNotification();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async update(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  // Send message to service worker
  sendMessage(message: any): void {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  // Handle messages from service worker
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;
    
    switch (data.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', data.cacheName);
        break;
      case 'OFFLINE_FALLBACK':
        this.showOfflineNotification();
        break;
      default:
        console.log('Service Worker message:', data);
    }
  }

  // Show update notification
  private showUpdateNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Update Available', {
        body: 'A new version of the app is available. Refresh to update.',
        icon: '/icon-192x192.png',
        tag: 'app-update'
      });
    } else {
      // Fallback to custom notification
      this.showCustomNotification('App Update Available', 'Refresh to get the latest version');
    }
  }

  // Show offline notification
  private showOfflineNotification(): void {
    this.showCustomNotification('You\'re Offline', 'Some features may be limited');
  }

  // Custom notification system
  private showCustomNotification(title: string, message: string): void {
    // Create a custom notification element
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <strong>${title}</strong>
        <p>${message}</p>
        <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Check if app is running in standalone mode (PWA)
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Get cache usage information
  async getCacheUsage(): Promise<{ quota: number; usage: number; percentage: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const quota = estimate.quota || 0;
        const usage = estimate.usage || 0;
        const percentage = quota > 0 ? (usage / quota) * 100 : 0;
        
        return { quota, usage, percentage };
      } catch (error) {
        console.error('Failed to get cache usage:', error);
      }
    }
    
    return null;
  }

  // Clear all caches
  async clearCaches(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
      } catch (error) {
        console.error('Failed to clear caches:', error);
      }
    }
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.setupObservers();
  }

  private setupObservers(): void {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      this.createObserver(['largest-contentful-paint'], (entries) => {
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });

      // First Input Delay
      this.createObserver(['first-input'], (entries) => {
        entries.forEach(entry => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });

      // Cumulative Layout Shift
      this.createObserver(['layout-shift'], (entries) => {
        let clsValue = 0;
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue);
      });

      // Navigation timing
      this.createObserver(['navigation'], (entries) => {
        entries.forEach(entry => {
          this.recordMetric('TTFB', entry.responseStart - entry.fetchStart);
          this.recordMetric('Load', entry.loadEventEnd - entry.fetchStart);
          this.recordMetric('DOMContentLoaded', entry.domContentLoadedEventEnd - entry.fetchStart);
        });
      });

      // Resource timing
      this.createObserver(['resource'], (entries) => {
        entries.forEach(entry => {
          if (entry.duration > 100) { // Only track slow resources
            this.recordMetric(`Resource_${entry.name}`, entry.duration);
          }
        });
      });
    }
  }

  private createObserver(entryTypes: string[], callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ entryTypes });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to create observer for ${entryTypes}:`, error);
    }
  }

  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_parameter: name
      });
    }
    
    // Send to service worker for logging
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PERFORMANCE_MEASURE',
        measure: { name, value }
      });
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Measure custom performance
  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    const duration = measure?.duration || 0;
    
    this.recordMetric(name, duration);
    return duration;
  }

  // Get Core Web Vitals scores
  getCoreWebVitals(): { lcp?: number; fid?: number; cls?: number } {
    return {
      lcp: this.metrics.get('LCP'),
      fid: this.metrics.get('FID'),
      cls: this.metrics.get('CLS')
    };
  }

  // Check if Core Web Vitals are "Good"
  areWebVitalsGood(): boolean {
    const vitals = this.getCoreWebVitals();
    
    const lcpGood = !vitals.lcp || vitals.lcp <= 2500;
    const fidGood = !vitals.fid || vitals.fid <= 100;
    const clsGood = !vitals.cls || vitals.cls <= 0.1;
    
    return lcpGood && fidGood && clsGood;
  }

  // Cleanup observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Image optimization utilities
export class ImageOptimizer {
  private intersectionObserver?: IntersectionObserver;
  private loadedImages = new Set<string>();

  constructor() {
    this.setupLazyLoading();
  }

  private setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target as HTMLImageElement);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  // Add image for lazy loading
  observeImage(img: HTMLImageElement): void {
    if (this.intersectionObserver && !this.loadedImages.has(img.src)) {
      this.intersectionObserver.observe(img);
    }
  }

  // Load image with optimization
  private async loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src || img.src;
    
    if (this.loadedImages.has(src)) {
      return;
    }

    try {
      // Create optimized image URL
      const optimizedSrc = this.getOptimizedImageUrl(src, img);
      
      // Preload the image
      const imageLoader = new Image();
      imageLoader.onload = () => {
        img.src = optimizedSrc;
        img.classList.add('loaded');
        this.loadedImages.add(src);
        
        if (this.intersectionObserver) {
          this.intersectionObserver.unobserve(img);
        }
      };
      
      imageLoader.onerror = () => {
        // Fallback to original image
        img.src = src;
        img.classList.add('error');
      };
      
      imageLoader.src = optimizedSrc;
      
    } catch (error) {
      console.error('Failed to load image:', error);
      img.src = src;
    }
  }

  // Generate optimized image URL
  private getOptimizedImageUrl(src: string, img: HTMLImageElement): string {
    // If using a CDN like Cloudinary, Imgix, or similar
    // This is a simplified example - adapt to your CDN
    
    const width = img.width || img.offsetWidth || 800;
    const height = img.height || img.offsetHeight || 600;
    
    // Support for modern image formats
    const supportsWebP = this.supportsImageFormat('webp');
    const supportsAVIF = this.supportsImageFormat('avif');
    
    let format = 'auto';
    if (supportsAVIF) format = 'avif';
    else if (supportsWebP) format = 'webp';
    
    // Example CDN URL transformation
    if (src.includes('your-cdn.com')) {
      return `${src}?w=${width}&h=${height}&f=${format}&q=80`;
    }
    
    return src;
  }

  // Check image format support
  private supportsImageFormat(format: string): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
  }

  // Preload critical images
  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        });
      })
    );
  }

  // Cleanup
  disconnect(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}

// Initialize performance optimization
export function initializePerformanceOptimization(): {
  serviceWorker: ServiceWorkerManager;
  performance: PerformanceMonitor;
  images: ImageOptimizer;
} {
  const serviceWorker = new ServiceWorkerManager();
  const performance = new PerformanceMonitor();
  const images = new ImageOptimizer();

  // Setup automatic lazy loading for all images
  document.addEventListener('DOMContentLoaded', () => {
    const images_elements = document.querySelectorAll('img[data-src]');
    images_elements.forEach(img => images.observeImage(img as HTMLImageElement));
  });

  return { serviceWorker, performance, images };
}