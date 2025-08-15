export interface WebhookEndpoint {
    id: number;
    name: string;
    url: string;
    events: string[];
    secret?: string;
    headers?: any;
    isActive: boolean;
    retryCount: number;
    timeoutSeconds: number;
    schoolId?: number;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface WebhookDelivery {
    id: number;
    endpointId: number;
    eventType: string;
    payload: any;
    status: 'pending' | 'delivered' | 'failed' | 'cancelled';
    responseStatus?: number;
    responseBody?: string;
    responseHeaders?: any;
    attemptCount: number;
    nextRetryAt?: Date;
    deliveredAt?: Date;
    createdAt: Date;
  }
  