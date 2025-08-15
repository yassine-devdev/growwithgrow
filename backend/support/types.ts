export interface Ticket {
    id: number;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'on_hold' | 'closed' | 'resolved';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category?: string;
    createdBy: number;
    assignedTo?: number;
    schoolId?: number;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
  }
  
  export interface TicketReply {
    id: number;
    ticketId: number;
    userId: number;
    content: string;
    attachments?: string[];
    isInternalNote: boolean;
    createdAt: Date;
  }
  