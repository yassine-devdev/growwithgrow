# Backend-Frontend Integration Design

## Overview

This design document outlines the architecture and implementation approach for integrating the existing Encore.ts backend with the React frontend. The integration will transform the current mock-data frontend into a fully functional production system connected to real backend services.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   API Gateway   │    │ Encore.ts Backend│
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │                 │    │ ┌─────────────┐ │
│ │ API Service │◄┼────┼─────────────────┼────┤ │ Dashboard   │ │
│ │   Layer     │ │    │                 │    │ │ Service     │ │
│ └─────────────┘ │    │                 │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │                 │    │ ┌─────────────┐ │
│ │ State Mgmt  │ │    │                 │    │ │ Core        │ │
│ │ (React)     │ │    │                 │    │ │ Service     │ │
│ └─────────────┘ │    │                 │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │                 │    │ ┌─────────────┐ │
│ │ UI          │ │    │                 │    │ │ School-Hub  │ │
│ │ Components  │ │    │                 │    │ │ Service     │ │
│ └─────────────┘ │    │                 │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture

```
frontend/
├── services/
│   ├── api/
│   │   ├── client.ts          # HTTP client configuration
│   │   ├── types.ts           # API request/response types
│   │   ├── dashboard.ts       # Dashboard API calls
│   │   ├── core.ts            # User/School API calls
│   │   ├── schoolHub.ts       # School Hub API calls
│   │   ├── ai.ts              # AI service API calls
│   │   ├── crm.ts             # CRM API calls
│   │   └── index.ts           # API service exports
│   ├── hooks/
│   │   ├── useApi.ts          # Generic API hook
│   │   ├── useDashboard.ts    # Dashboard data hooks
│   │   ├── useUsers.ts        # User management hooks
│   │   └── useSchools.ts      # School management hooks
│   └── utils/
│       ├── cache.ts           # Data caching utilities
│       ├── errors.ts          # Error handling utilities
│       └── validation.ts      # Data validation utilities
├── store/
│   ├── slices/
│   │   ├── dashboard.ts       # Dashboard state
│   │   ├── users.ts           # User state
│   │   ├── schools.ts         # School state
│   │   └── ui.ts              # UI state (loading, errors)
│   └── index.ts               # Store configuration
└── components/
    ├── common/
    │   ├── LoadingSpinner.tsx
    │   ├── ErrorBoundary.tsx
    │   └── DataTable.tsx
    └── ...existing components
```

## Components and Interfaces

### API Service Layer

#### HTTP Client Configuration
```typescript
// services/api/client.ts
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

class ApiClient {
  private client: AxiosInstance;
  
  constructor(config: ApiClientConfig);
  
  // Request interceptors for auth, logging
  setupInterceptors(): void;
  
  // Generic request methods
  get<T>(url: string, params?: any): Promise<T>;
  post<T>(url: string, data?: any): Promise<T>;
  put<T>(url: string, data?: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
  
  // Error handling
  handleError(error: AxiosError): never;
}
```

#### Service-Specific API Modules
```typescript
// services/api/dashboard.ts
export interface DashboardApi {
  getKPIs(params: GetKPIsRequest): Promise<GetKPIsResponse>;
  getSalesChart(params: GetSalesRequest): Promise<GetSalesResponse>;
  getUserGrowth(params: GetUserGrowthRequest): Promise<GetUserGrowthResponse>;
  getAlerts(params: GetAlertsRequest): Promise<GetAlertsResponse>;
  createAlert(data: CreateAlertRequest): Promise<CreateAlertResponse>;
}

// services/api/core.ts
export interface CoreApi {
  listUsers(params: ListUsersRequest): Promise<ListUsersResponse>;
  getUser(id: number): Promise<User>;
  createUser(data: CreateUserRequest): Promise<User>;
  updateUser(id: number, data: UpdateUserRequest): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  listSchools(params: ListSchoolsRequest): Promise<ListSchoolsResponse>;
  getSchool(id: number): Promise<School>;
  createSchool(data: CreateSchoolRequest): Promise<School>;
}
```

### React Hooks for Data Management

#### Generic API Hook
```typescript
// services/hooks/useApi.ts
interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options?: UseApiOptions<T>
): UseApiResult<T>;
```

#### Dashboard-Specific Hooks
```typescript
// services/hooks/useDashboard.ts
export function useDashboardKPIs(params?: GetKPIsRequest) {
  return useApi(() => dashboardApi.getKPIs(params), {
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useSalesChart(params?: GetSalesRequest) {
  return useApi(() => dashboardApi.getSalesChart(params));
}

export function useCreateAlert() {
  const [mutate, { loading, error }] = useMutation(
    (data: CreateAlertRequest) => dashboardApi.createAlert(data)
  );
  
  return { createAlert: mutate, loading, error };
}
```

### State Management

#### Redux Toolkit Slices
```typescript
// store/slices/dashboard.ts
interface DashboardState {
  kpis: {
    data: KPI[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
  };
  salesChart: {
    data: SalesData[];
    loading: boolean;
    error: string | null;
  };
  alerts: {
    data: Alert[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
  };
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setKPIsLoading: (state, action) => {
      state.kpis.loading = action.payload;
    },
    setKPIsData: (state, action) => {
      state.kpis.data = action.payload;
      state.kpis.lastUpdated = new Date();
      state.kpis.loading = false;
      state.kpis.error = null;
    },
    setKPIsError: (state, action) => {
      state.kpis.error = action.payload;
      state.kpis.loading = false;
    },
    // ... other reducers
  },
});
```

### Error Handling Strategy

#### Error Types and Handling
```typescript
// services/utils/errors.ts
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    public message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
  }
}

export function handleApiError(error: AxiosError): ApiError {
  if (error.code === 'ECONNABORTED') {
    return new ApiError(ApiErrorType.TIMEOUT_ERROR, 'Request timeout');
  }
  
  if (!error.response) {
    return new ApiError(ApiErrorType.NETWORK_ERROR, 'Network error');
  }
  
  const { status, data } = error.response;
  
  switch (status) {
    case 401:
      return new ApiError(ApiErrorType.AUTHENTICATION_ERROR, 'Authentication required');
    case 403:
      return new ApiError(ApiErrorType.AUTHORIZATION_ERROR, 'Access denied');
    case 422:
      return new ApiError(ApiErrorType.VALIDATION_ERROR, 'Validation failed', status, data);
    default:
      return new ApiError(ApiErrorType.SERVER_ERROR, 'Server error', status, data);
  }
}
```

## Data Models

### API Request/Response Types

#### Dashboard Types
```typescript
// services/api/types.ts
export interface GetKPIsRequest {
  schoolId?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetKPIsResponse {
  kpis: KPI[];
}

export interface KPI {
  id: number;
  name: string;
  value: number;
  unit?: string;
  category: string;
  description?: string;
  targetValue?: number;
  trend?: 'up' | 'down' | 'stable';
  periodStart: string;
  periodEnd: string;
  schoolId?: number;
  createdAt: string;
  updatedAt: string;
}
```

#### User Management Types
```typescript
export interface ListUsersRequest {
  limit?: number;
  offset?: number;
  role?: string;
  schoolId?: number;
}

export interface ListUsersResponse {
  users: User[];
  total: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'provider';
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Data Transformation Layer

```typescript
// services/utils/transformers.ts
export class DataTransformer {
  static transformKPI(apiKPI: any): KPI {
    return {
      ...apiKPI,
      periodStart: new Date(apiKPI.periodStart),
      periodEnd: new Date(apiKPI.periodEnd),
      createdAt: new Date(apiKPI.createdAt),
      updatedAt: new Date(apiKPI.updatedAt),
    };
  }
  
  static transformUser(apiUser: any): User {
    return {
      ...apiUser,
      dateOfBirth: apiUser.dateOfBirth ? new Date(apiUser.dateOfBirth) : undefined,
      createdAt: new Date(apiUser.createdAt),
      updatedAt: new Date(apiUser.updatedAt),
    };
  }
}
```

## Error Handling

### Error Boundary Implementation
```typescript
// components/common/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Loading States and Skeletons
```typescript
// components/common/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  overlay = false
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${overlay ? 'absolute inset-0 bg-black/50' : ''}`}>
      <div className={`animate-spin rounded-full border-2 border-cyber-cyan border-t-transparent ${sizeClasses[size]}`} />
      {message && <p className="mt-2 text-sm text-gray-400">{message}</p>}
    </div>
  );
};
```

## Testing Strategy

### API Service Testing
```typescript
// services/api/__tests__/dashboard.test.ts
describe('Dashboard API', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('should fetch KPIs successfully', async () => {
    const mockKPIs = [{ id: 1, name: 'Test KPI', value: 100 }];
    mockAxios.get.mockResolvedValueOnce({ data: { kpis: mockKPIs } });

    const result = await dashboardApi.getKPIs();

    expect(mockAxios.get).toHaveBeenCalledWith('/dashboard/kpis');
    expect(result.kpis).toEqual(mockKPIs);
  });

  it('should handle API errors', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(dashboardApi.getKPIs()).rejects.toThrow('Network error');
  });
});
```

### Hook Testing
```typescript
// services/hooks/__tests__/useDashboard.test.ts
describe('useDashboardKPIs', () => {
  it('should fetch and return KPI data', async () => {
    const mockKPIs = [{ id: 1, name: 'Test KPI' }];
    jest.spyOn(dashboardApi, 'getKPIs').mockResolvedValue({ kpis: mockKPIs });

    const { result, waitForNextUpdate } = renderHook(() => useDashboardKPIs());

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data?.kpis).toEqual(mockKPIs);
  });
});
```

## Performance Optimization

### Caching Strategy
```typescript
// services/utils/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Request Batching
```typescript
// services/utils/batching.ts
class RequestBatcher {
  private batches = new Map<string, Promise<any>>();

  batch<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.batches.has(key)) {
      return this.batches.get(key)!;
    }

    const promise = request().finally(() => {
      this.batches.delete(key);
    });

    this.batches.set(key, promise);
    return promise;
  }
}
```

## Security Considerations

### Authentication Integration
```typescript
// services/auth/authService.ts
interface AuthService {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  isAuthenticated(): boolean;
  refreshToken(): Promise<string>;
}

// API client integration
apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Data Validation
```typescript
// services/utils/validation.ts
import { z } from 'zod';

const KPISchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
  category: z.string(),
  // ... other fields
});

export function validateKPI(data: unknown): KPI {
  return KPISchema.parse(data);
}
```

This design provides a comprehensive foundation for integrating the backend and frontend while maintaining type safety, error handling, and performance optimization.