import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';

// Dynamic import wrapper with error handling
export function createAsyncComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): LazyExoticComponent<T> {
  const LazyComponent = lazy(async () => {
    try {
      const module = await importFunc();
      return module;
    } catch (error) {
      console.error('Failed to load component:', error);
      // Return a fallback component in case of error
      return {
        default: (props: any) => (
          <div className="component-load-error">
            <p>Failed to load component. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        )
      } as { default: T };
    }
  });

  return LazyComponent;
}

// Route-based code splitting
export const RouteComponents = {
  // Dashboard routes
  Dashboard: createAsyncComponent(() => import('../components/Dashboard')),
  DashboardAnalytics: createAsyncComponent(() => import('../components/Dashboard/Analytics')),
  DashboardSettings: createAsyncComponent(() => import('../components/Dashboard/Settings')),
  
  // AI features
  AIChat: createAsyncComponent(() => import('../components/AI/Chat')),
  AIPromptManager: createAsyncComponent(() => import('../components/AI/PromptManager')),
  AIUsageTracker: createAsyncComponent(() => import('../components/AI/UsageTracker')),
  
  // CRM features
  CRMContacts: createAsyncComponent(() => import('../components/CRM/Contacts')),
  CRMDeals: createAsyncComponent(() => import('../components/CRM/Deals')),
  CRMReports: createAsyncComponent(() => import('../components/CRM/Reports')),
  
  // Admin features
  AdminUsers: createAsyncComponent(() => import('../components/Admin/Users')),
  AdminSchools: createAsyncComponent(() => import('../components/Admin/Schools')),
  AdminSettings: createAsyncComponent(() => import('../components/Admin/Settings')),
  
  // Authentication
  Login: createAsyncComponent(() => import('../components/Auth/Login')),
  Register: createAsyncComponent(() => import('../components/Auth/Register')),
  ForgotPassword: createAsyncComponent(() => import('../components/Auth/ForgotPassword')),
};

// Feature-based code splitting
export const FeatureComponents = {
  // Charts and visualization
  Charts: createAsyncComponent(() => import('../components/Charts')),
  DataVisualization: createAsyncComponent(() => import('../components/DataVisualization')),
  
  // File handling
  FileUploader: createAsyncComponent(() => import('../components/FileUploader')),
  ImageEditor: createAsyncComponent(() => import('../components/ImageEditor')),
  
  // Advanced features
  VideoPlayer: createAsyncComponent(() => import('../components/VideoPlayer')),
  PDFViewer: createAsyncComponent(() => import('../components/PDFViewer')),
  CodeEditor: createAsyncComponent(() => import('../components/CodeEditor')),
};

// Loading components
export const LoadingSpinner: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ 
  lines?: number;
  height?: string;
  className?: string;
}> = ({ 
  lines = 3, 
  height = '20px',
  className = ''
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-300 rounded mb-2"
          style={{ height, width: `${100 - (index * 10)}%` }}
        />
      ))}
    </div>
  );
};

export const LoadingCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>
  </div>
);

// Suspense wrapper with error boundary
interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  fallback: Fallback = LoadingSpinner,
  errorFallback: ErrorFallback
}) => {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={<Fallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Error boundary for lazy-loaded components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo);
    
    // Report error to monitoring service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} retry={this.retry} />;
      }
      
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={this.retry} className="retry-button">
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Preloader for critical components
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();

  // Preload component on hover or focus
  static preloadOnHover(componentName: keyof typeof RouteComponents) {
    return {
      onMouseEnter: () => this.preload(componentName),
      onFocus: () => this.preload(componentName)
    };
  }

  // Preload component immediately
  static async preload(componentName: keyof typeof RouteComponents): Promise<void> {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    try {
      // This will trigger the dynamic import
      const Component = RouteComponents[componentName];
      
      // Create a temporary element to trigger the import
      const tempElement = React.createElement(Component);
      
      this.preloadedComponents.add(componentName);
      console.log(`Preloaded component: ${componentName}`);
    } catch (error) {
      console.error(`Failed to preload component ${componentName}:`, error);
    }
  }

  // Preload multiple components
  static async preloadMultiple(componentNames: Array<keyof typeof RouteComponents>): Promise<void> {
    const promises = componentNames.map(name => this.preload(name));
    await Promise.allSettled(promises);
  }

  // Preload based on user role or permissions
  static preloadForRole(role: 'admin' | 'user' | 'guest'): void {
    const roleComponents = {
      admin: ['AdminUsers', 'AdminSchools', 'AdminSettings'] as const,
      user: ['Dashboard', 'AIChat', 'CRMContacts'] as const,
      guest: ['Login', 'Register'] as const
    };

    this.preloadMultiple(roleComponents[role]);
  }

  // Preload based on route
  static preloadForRoute(route: string): void {
    const routeComponentMap: Record<string, Array<keyof typeof RouteComponents>> = {
      '/dashboard': ['Dashboard', 'DashboardAnalytics'],
      '/ai': ['AIChat', 'AIPromptManager'],
      '/crm': ['CRMContacts', 'CRMDeals'],
      '/admin': ['AdminUsers', 'AdminSchools']
    };

    const components = routeComponentMap[route];
    if (components) {
      this.preloadMultiple(components);
    }
  }
}

// Resource hints for performance
export class ResourceHints {
  // Add DNS prefetch
  static addDNSPrefetch(domains: string[]): void {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  // Add preconnect
  static addPreconnect(origins: string[]): void {
    origins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      document.head.appendChild(link);
    });
  }

  // Add resource preload
  static addPreload(resources: Array<{ href: string; as: string; type?: string }>): void {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      document.head.appendChild(link);
    });
  }

  // Add module preload
  static addModulePreload(modules: string[]): void {
    modules.forEach(module => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = module;
      document.head.appendChild(link);
    });
  }
}

// Performance monitoring for code splitting
export class CodeSplittingMetrics {
  private static metrics = new Map<string, number>();

  // Record component load time
  static recordLoadTime(componentName: string, loadTime: number): void {
    this.metrics.set(`${componentName}_load_time`, loadTime);
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: 'component_load',
        value: loadTime,
        event_category: 'Performance',
        event_label: componentName
      });
    }
  }

  // Get average load time
  static getAverageLoadTime(componentName: string): number {
    const times = Array.from(this.metrics.entries())
      .filter(([key]) => key.startsWith(`${componentName}_load_time`))
      .map(([, time]) => time);
    
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }

  // Get all metrics
  static getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

// HOC for measuring component load time
export function withLoadTimeTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return React.forwardRef<any, P>((props, ref) => {
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const loadTime = performance.now() - startTime;
        CodeSplittingMetrics.recordLoadTime(componentName, loadTime);
      };
    }, []);

    return <WrappedComponent {...props} ref={ref} />;
  });
}

// Initialize performance optimizations
export function initializeCodeSplitting(): void {
  // Add resource hints for common external resources
  ResourceHints.addDNSPrefetch([
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'api.openai.com',
    'generativelanguage.googleapis.com'
  ]);

  ResourceHints.addPreconnect([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]);

  // Preload critical fonts
  ResourceHints.addPreload([
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      as: 'style',
      type: 'text/css'
    }
  ]);

  console.log('Code splitting optimizations initialized');
}