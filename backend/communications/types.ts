export interface Email {
    id: number;
    senderId: number;
    recipientIds: number[];
    ccIds?: number[];
    bccIds?: number[];
    subject: string;
    body: string;
    htmlBody?: string;
    attachments?: string[];
    status: 'draft' | 'sent' | 'delivered' | 'failed';
    sentAt?: Date;
    deliveredAt?: Date;
    isRead: boolean;
    readAt?: Date;
    threadId?: number;
    replyToId?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    htmlBody?: string;
    templateType: 'personal' | 'public' | 'system';
    category?: string;
    variables?: string[];
    createdBy: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Announcement {
    id: number;
    title: string;
    content: string;
    announcementType: 'general' | 'urgent' | 'academic' | 'event' | 'system';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    targetAudience: 'all' | 'students' | 'teachers' | 'parents' | 'staff';
    schoolId?: number;
    gradeLevels?: string[];
    classIds?: number[];
    publishedAt?: Date;
    expiresAt?: Date;
    createdBy: number;
    isPublished: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CalendarEvent {
    id: number;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    eventType: 'meeting' | 'class' | 'exam' | 'event' | 'holiday' | 'deadline';
    recurrenceRule?: string;
    attendeeIds?: number[];
    organizerId: number;
    schoolId?: number;
    classId?: number;
    isAllDay: boolean;
    reminderMinutes?: number[];
    status: 'tentative' | 'confirmed' | 'cancelled';
    visibility: 'public' | 'private' | 'confidential';
    createdAt: Date;
    updatedAt: Date;
  }
  