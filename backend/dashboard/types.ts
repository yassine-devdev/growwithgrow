export interface KPI {
    id: number;
    name: string;
    value: number;
    unit?: string;
    category: string;
    description?: string;
    targetValue?: number;
    trend?: 'up' | 'down' | 'stable';
    periodStart: Date;
    periodEnd: Date;
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface SalesData {
    id: number;
    date: Date;
    revenue: number;
    transactions: number;
    newCustomers: number;
    productCategory?: string;
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface UserGrowth {
    id: number;
    date: Date;
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
    userType?: 'student' | 'teacher' | 'parent' | 'admin';
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Alert {
    id: number;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    isRead: boolean;
    isResolved: boolean;
    schoolId?: number;
    userId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  