import { useEffect, useRef, useState, useCallback } from 'react';
import { PerformanceMonitor } from '../lib/performance/service-worker';

// Hook for performance monitoring
export function usePerformance() {
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [webVitals, setWebVitals] = useState<{ lcp?: number; fid?: number; cls?: number }>({});
  const performanceMonitor = useRef<PerformanceMonitor | null>(null);

  useEffect(() => {
    performanceMonitor.current = new PerformanceMonitor();

    const updateMetrics = () => {
      if (performanceMonitor.current) {
        setMetrics(performanceMonitor.current.getMetrics());
        setWebVitals(performanceMonitor.current.getCoreWebVitals());
      }
    };

    const interval = setInterval(updateMetrics, 1000);

    return () => {
      clearInterval(interval);
      performanceMonitor.current?.disconnect();
    };
  }, []);

  const startMeasure = useCallback((name: string) => {
    performanceMonitor.current?.startMeasure(name);
  }, []);

  const endMeasure = useCallback((name: string) => {
    return performanceMonitor.current?.endMeasure(name) || 0;
  }, []);

  const recordMetric = useCallback((name: string, value: number) => {
    performanceMonitor.current?.recordMetric(name, value);
  }, []);

  return {
    metrics,
    webVitals,
    startMeasure,
    endMeasure,
    recordMetric,
    areWebVitalsGood: performanceMonitor.current?.areWebVitalsGood() || false
  };
}

// Hook for lazy loading images
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, isLoaded, src]);

  return {
    imgRef,
    src: isLoaded ? src : undefined,
    isLoaded,
    isInView
  };
}

// Hook for code splitting and lazy loading components
export function useLazyComponent<T>(
  importFn: () => Promise<{ default: T }>,
  deps: any[] = []
) {
  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (component) return;

    setLoading(true);
    setError(null);

    try {
      const module = await importFn();
      setComponent(module.default);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
    } finally {
      setLoading(false);
    }
  }, [importFn, component]);

  useEffect(() => {
    loadComponent();
  }, [loadComponent, ...deps]);

  return { component, loading, error, reload: loadComponent };
}

// Hook for measuring component render performance
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  const performanceMonitor = useRef<PerformanceMonitor | null>(null);

  useEffect(() => {
    if (!performanceMonitor.current) {
      performanceMonitor.current = new PerformanceMonitor();
    }
  }, []);

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    
    if (lastRenderTime.current > 0) {
      const renderDuration = now - lastRenderTime.current;
      performanceMonitor.current?.recordMetric(
        `${componentName}_render_duration`,
        renderDuration
      );
    }
    
    lastRenderTime.current = now;
    
    performanceMonitor.current?.recordMetric(
      `${componentName}_render_count`,
      renderCount.current
    );
  });

  return {
    renderCount: renderCount.current,
    recordCustomMetric: (name: string, value: number) => {
      performanceMonitor.current?.recordMetric(`${componentName}_${name}`, value);
    }
  };
}

// Hook for optimizing expensive calculations
export function useOptimizedCalculation<T>(
  calculation: () => T,
  deps: any[],
  options?: {
    debounceMs?: number;
    cacheSize?: number;
  }
) {
  const [result, setResult] = useState<T | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const cache = useRef(new Map<string, T>());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const { debounceMs = 0, cacheSize = 10 } = options || {};

  const performCalculation = useCallback(() => {
    const cacheKey = JSON.stringify(deps);
    
    // Check cache first
    if (cache.current.has(cacheKey)) {
      setResult(cache.current.get(cacheKey)!);
      return;
    }

    setIsCalculating(true);
    
    // Use requestIdleCallback for non-urgent calculations
    const calculate = () => {
      try {
        const calculationResult = calculation();
        
        // Update cache
        cache.current.set(cacheKey, calculationResult);
        
        // Limit cache size
        if (cache.current.size > cacheSize) {
          const firstKey = cache.current.keys().next().value;
          cache.current.delete(firstKey);
        }
        
        setResult(calculationResult);
      } catch (error) {
        console.error('Calculation error:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(calculate, { timeout: 1000 });
    } else {
      setTimeout(calculate, 0);
    }
  }, [calculation, deps, cacheSize]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(performCalculation, debounceMs);
    } else {
      performCalculation();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [performCalculation, debounceMs]);

  return { result, isCalculating };
}

// Hook for virtual scrolling
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    handleScroll
  };
}

// Hook for connection status and adaptive loading
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [effectiveType, setEffectiveType] = useState<string>('4g');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API (experimental)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.type || 'unknown');
      setEffectiveType(connection.effectiveType || '4g');

      const handleConnectionChange = () => {
        setConnectionType(connection.type || 'unknown');
        setEffectiveType(connection.effectiveType || '4g');
      };

      connection.addEventListener('change', handleConnectionChange);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isSlowConnection = effectiveType === 'slow-2g' || effectiveType === '2g';
  const shouldReduceData = !isOnline || isSlowConnection;

  return {
    isOnline,
    connectionType,
    effectiveType,
    isSlowConnection,
    shouldReduceData
  };
}