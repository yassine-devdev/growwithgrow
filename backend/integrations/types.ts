export interface Integration {
    id: number;
    name: string;
    provider: string;
    integrationType: 'sso' | 'calendar' | 'email' | 'video' | 'storage' | 'lms' | 'payment';
    status: 'active' | 'inactive' | 'error' | 'pending';
    config: any;
    credentials?: any;
    webhookUrl?: string;
    lastSync?: Date;
    syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
    errorMessage?: string;
    schoolId?: number;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface SyncLog {
    id: number;
    integrationId: number;
    syncType: string;
    status: 'started' | 'completed' | 'failed' | 'cancelled';
    recordsProcessed: number;
    recordsCreated: number;
    recordsUpdated: number;
    recordsFailed: number;
    errorMessage?: string;
    startedAt: Date;
    completedAt?: Date;
    durationSeconds?: number;
  }
  