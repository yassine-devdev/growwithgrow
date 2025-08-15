export interface Notification {
    id: number;
    userId: number;
    title: string;
    message: string;
    notificationType: 'info' | 'success' | 'warning' | 'error' | 'assignment' | 'grade' | 'announcement' | 'reminder';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    data?: any;
    isRead: boolean;
    readAt?: Date;
    actionUrl?: string;
    schoolId?: number;
    classId?: number;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface NotificationPreference {
    id: number;
    userId: number;
    notificationType: string;
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    inAppEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  