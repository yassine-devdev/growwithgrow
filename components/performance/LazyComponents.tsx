import React, { Suspense, lazy, ComponentType } from 'react';
import { useLazyComponent, useConnectionStatus } from '../../hooks/usePerformance';

// Loading component
const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
    <span className="text-gray-600">{message}</span>
  </div>
);

// Error boundary for lazy components
class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
    <h3 className="text-red-800 font-medium">Failed to load component</h3>
    <p className="text-red-600 text-sm mt-1">{error.message}</p>
    <button
      onClick={() => window.location.reload()}
      className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
    >
      Reload Page
    </button>
  </div>
);

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    fallback?: React.ComponentType;
    errorFallback?: React.ComponentType<{ error: Error }>;
    preload?: boolean;
  }
) {
  const LazyComponent = lazy(importFn);
  
  // Preload component if requested
  if (options?.preload) {
    importFn().catch(console.error);
  }

  return function WrappedLazyComponent(props: P) {
    const FallbackComponent = options?.fallback || LoadingSpinner;
    
    return (
      <LazyComponentErrorBoundary fallback={options?.errorFallback}>
        <Suspense fallback={<FallbackComponent />}>
          <LazyComponent {...props} />
        </Suspense>
      </LazyComponentErrorBoundary>
    );
  };
}

// Conditional lazy loading based on connection
export function withAdaptiveLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  lightweightFallback: ComponentType<P>,
  options?: {
    fallback?: React.ComponentType;
    errorFallback?: React.ComponentType<{ error: Error }>;
  }
) {
  return function AdaptiveLazyComponent(props: P) {
    const { shouldReduceData } = useConnectionStatus();
    
    if (shouldReduceData) {
      // Use lightweight fallback for slow connections
      return <lightweightFallback {...props} />;
    }
    
    const LazyComponent = withLazyLoading(importFn, options);
    return <LazyComponent {...props} />;
  };
}

// Route-based code splitting
export const LazyRoute: React.FC<{
  importFn: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error }>;
  preload?: boolean;
}> = ({ importFn, fallback, errorFallback, preload }) => {
  const LazyComponent = withLazyLoading(importFn, { fallback, errorFallback, preload });
  return <LazyComponent />;
};

// Intersection-based lazy loading
export const IntersectionLazyComponent: React.FC<{
  importFn: () => Promise<{ default: ComponentType<any> }>;
  placeholder?: React.ComponentType;
  rootMargin?: string;
  threshold?: number;
  props?: any;
}> = ({ 
  importFn, 
  placeholder: Placeholder = LoadingSpinner, 
  rootMargin = '100px',
  threshold = 0.1,
  props = {}
}) => {
  const [isInView, setIsInView] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  if (!isInView) {
    return (
      <div ref={ref}>
        <Placeholder />
      </div>
    );
  }

  const LazyComponent = withLazyLoading(importFn);
  return <LazyComponent {...props} />;
};

// Bundle splitting for feature modules
export const FeatureModule: React.FC<{
  feature: string;
  children: React.ReactNode;
  fallback?: React.ComponentType;
}> = ({ feature, children, fallback: Fallback = LoadingSpinner }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    // Dynamically import feature-specific code
    import(`../../features/${feature}/index.ts`)
      .then(() => setIsLoaded(true))
      .catch(setError);
  }, [feature]);

  if (error) {
    return <DefaultErrorFallback error={error} />;
  }

  if (!isLoaded) {
    return <Fallback />;
  }

  return <>{children}</>;
};

// Performance-optimized list component
export const VirtualizedList: React.FC<{
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
}> = ({ items, itemHeight, containerHeight, renderItem, overscan = 5 }) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Memoized component wrapper
export function withMemoization<P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return React.memo(Component, areEqual);
}

// Performance monitoring wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const renderStart = React.useRef(0);
    const [renderCount, setRenderCount] = React.useState(0);

    React.useEffect(() => {
      renderStart.current = performance.now();
      setRenderCount(prev => prev + 1);
    });

    React.useLayoutEffect(() => {
      const renderTime = performance.now() - renderStart.current;
      
      // Log performance metrics
      if (renderTime > 16) { // Longer than one frame
        console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
      
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'component_render', {
          component_name: componentName,
          render_time: Math.round(renderTime),
          render_count: renderCount
        });
      }
    });

    return <Component {...props} />;
  };
}

// Preloader for critical components
export const ComponentPreloader: React.FC<{
  components: Array<() => Promise<{ default: ComponentType<any> }>>;
}> = ({ components }) => {
  React.useEffect(() => {
    // Preload components when browser is idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        components.forEach(importFn => {
          importFn().catch(console.error);
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        components.forEach(importFn => {
          importFn().catch(console.error);
        });
      }, 1000);
    }
  }, [components]);

  return null;
};