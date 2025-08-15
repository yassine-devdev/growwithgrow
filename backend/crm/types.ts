export interface Contact {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    contactType: 'lead' | 'customer' | 'partner' | 'vendor';
    source?: string;
    tags?: string[];
    notes?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Lead {
    id: number;
    contactId: number;
    status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    score: number;
    source?: string;
    campaign?: string;
    estimatedValue?: number;
    probability: number;
    expectedCloseDate?: Date;
    assignedTo?: number;
    lastActivityDate?: Date;
    notes?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Account {
    id: number;
    name: string;
    accountType: 'school' | 'district' | 'organization' | 'individual';
    industry?: string;
    size?: 'small' | 'medium' | 'large' | 'enterprise';
    annualRevenue?: number;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    primaryContactId?: number;
    accountManagerId?: number;
    status: 'active' | 'inactive' | 'prospect' | 'customer';
    tags?: string[];
    notes?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Deal {
    id: number;
    name: string;
    accountId: number;
    contactId?: number;
    stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    amount: number;
    probability: number;
    expectedCloseDate?: Date;
    actualCloseDate?: Date;
    ownerId: number;
    source?: string;
    description?: string;
    nextStep?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Campaign {
    id: number;
    name: string;
    campaignType: 'email' | 'sms' | 'social' | 'webinar' | 'event' | 'direct_mail';
    status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    targetAudience?: string;
    description?: string;
    goals?: string;
    ownerId: number;
    metrics?: any;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  