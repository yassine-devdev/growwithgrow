// AppRouter type definitions for frontend development
// This matches the actual backend tRPC router structure

import { z } from 'zod';

// Dashboard types
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

export interface SalesData {
  id: number;
  date: string;
  revenue: number;
  transactions: number;
  newCustomers: number;
  productCategory?: string;
  schoolId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserGrowth {
  id: number;
  date: string;
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
  userType?: 'student' | 'teacher' | 'parent' | 'admin';
  schoolId?: number;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

// Input types
export interface GetKPIsInput {
  schoolId?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface GetSalesChartInput {
  schoolId?: number;
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

export interface GetAlertsInput {
  schoolId?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  isRead?: boolean;
  isResolved?: boolean;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface CreateAlertInput {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  schoolId?: number;
  userId?: number;
}

// AppRouter type that matches the backend structure
export type AppRouter = {
  dashboard: {
    getKPIs: {
      input: GetKPIsInput;
      output: {
        kpis: KPI[];
        total: number;
        hasMore: boolean;
      };
    };
    getSalesChart: {
      input: GetSalesChartInput;
      output: {
        salesData: SalesData[];
        summary: {
          totalRevenue: number;
          totalTransactions: number;
          averageOrderValue: number;
          growthRate: number;
        };
      };
    };
    getUserGrowth: {
      input: GetSalesChartInput;
      output: {
        userGrowth: UserGrowth[];
        summary: {
          totalUsers: number;
          newUsersThisPeriod: number;
          activeUsersThisPeriod: number;
          growthRate: number;
        };
      };
    };
    getAlerts: {
      input: GetAlertsInput;
      output: {
        alerts: Alert[];
        total: number;
        unreadCount: number;
        hasMore: boolean;
      };
    };
    createAlert: {
      input: CreateAlertInput;
      output: Alert;
    };
    onKPIUpdate: {
      input: {
        schoolId?: number;
        category?: string;
      };
      output: {
        message: string;
      };
    };
  };
  core: {
    users: {
      list: {
        input: {
          role?: 'admin' | 'teacher' | 'student' | 'parent';
          schoolId?: number;
          search?: string;
          isActive?: boolean;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          users: Array<{
            id: number;
            email: string;
            firstName: string;
            lastName: string;
            role: 'admin' | 'teacher' | 'student' | 'parent';
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
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      get: {
        input: { id: number };
        output: {
          id: number;
          email: string;
          firstName: string;
          lastName: string;
          role: 'admin' | 'teacher' | 'student' | 'parent';
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
        };
      };
      create: {
        input: {
          email: string;
          firstName: string;
          lastName: string;
          role: 'admin' | 'teacher' | 'student' | 'parent';
          avatarUrl?: string;
          phone?: string;
          dateOfBirth?: string;
          address?: string;
          city?: string;
          state?: string;
          country?: string;
          postalCode?: string;
        };
        output: {
          id: number;
          email: string;
          firstName: string;
          lastName: string;
          role: 'admin' | 'teacher' | 'student' | 'parent';
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
        };
      };
      update: {
        input: {
          id: number;
          email?: string;
          firstName?: string;
          lastName?: string;
          role?: 'admin' | 'teacher' | 'student' | 'parent';
          avatarUrl?: string;
          phone?: string;
          dateOfBirth?: string;
          address?: string;
          city?: string;
          state?: string;
          country?: string;
          postalCode?: string;
          isActive?: boolean;
        };
        output: {
          id: number;
          email: string;
          firstName: string;
          lastName: string;
          role: 'admin' | 'teacher' | 'student' | 'parent';
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
        };
      };
      delete: {
        input: { id: number };
        output: { success: boolean };
      };
    };
    schools: {
      list: {
        input: {
          search?: string;
          schoolType?: 'public' | 'private' | 'charter' | 'international';
          isActive?: boolean;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          schools: Array<{
            id: number;
            name: string;
            description?: string;
            address: string;
            city: string;
            state: string;
            country: string;
            postalCode: string;
            phone?: string;
            email?: string;
            website?: string;
            logoUrl?: string;
            establishedYear?: number;
            schoolType: 'public' | 'private' | 'charter' | 'international';
            gradeLevels: string[];
            studentCapacity?: number;
            currentEnrollment: number;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      get: {
        input: { id: number };
        output: {
          id: number;
          name: string;
          description?: string;
          address: string;
          city: string;
          state: string;
          country: string;
          postalCode: string;
          phone?: string;
          email?: string;
          website?: string;
          logoUrl?: string;
          establishedYear?: number;
          schoolType: 'public' | 'private' | 'charter' | 'international';
          gradeLevels: string[];
          studentCapacity?: number;
          currentEnrollment: number;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
      create: {
        input: {
          name: string;
          description?: string;
          address: string;
          city: string;
          state: string;
          country: string;
          postalCode: string;
          phone?: string;
          email?: string;
          website?: string;
          logoUrl?: string;
          establishedYear?: number;
          schoolType: 'public' | 'private' | 'charter' | 'international';
          gradeLevels: string[];
          studentCapacity?: number;
        };
        output: {
          id: number;
          name: string;
          description?: string;
          address: string;
          city: string;
          state: string;
          country: string;
          postalCode: string;
          phone?: string;
          email?: string;
          website?: string;
          logoUrl?: string;
          establishedYear?: number;
          schoolType: 'public' | 'private' | 'charter' | 'international';
          gradeLevels: string[];
          studentCapacity?: number;
          currentEnrollment: number;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    userSchools: {
      getUserSchools: {
        input: { userId: number };
        output: Array<{
          id: number;
          userId: number;
          schoolId: number;
          roleInSchool: 'admin' | 'teacher' | 'student' | 'parent';
          gradeLevel?: string;
          classSection?: string;
          subjectSpecialization?: string[];
          isActive: boolean;
          joinedAt: string;
        }>;
      };
      addUserToSchool: {
        input: {
          userId: number;
          schoolId: number;
          roleInSchool: 'admin' | 'teacher' | 'student' | 'parent';
          gradeLevel?: string;
          classSection?: string;
          subjectSpecialization?: string[];
        };
        output: {
          id: number;
          userId: number;
          schoolId: number;
          roleInSchool: 'admin' | 'teacher' | 'student' | 'parent';
          gradeLevel?: string;
          classSection?: string;
          subjectSpecialization?: string[];
          isActive: boolean;
          joinedAt: string;
        };
      };
    };
  };
  ai: {
    chat: {
      input: {
        message: string;
        conversationId?: number;
        provider?: 'openrouter' | 'ollama' | 'gemini';
        model?: string;
        temperature?: number;
        maxTokens?: number;
        systemPrompt?: string;
        contextType?: 'general' | 'academic' | 'administrative' | 'support';
      };
      output: {
        response: string;
        provider: string;
        model: string;
        tokensUsed: number;
        cost: number;
        conversationId: number;
        messageId: number;
      };
    };
    conversations: {
      list: {
        input: {
          contextType?: 'general' | 'academic' | 'administrative' | 'support';
          schoolId?: number;
          classId?: number;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          conversations: Array<{
            id: number;
            userId: number;
            title?: string;
            contextType: 'general' | 'academic' | 'administrative' | 'support';
            schoolId?: number;
            classId?: number;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      get: {
        input: { id: number };
        output: {
          conversation: {
            id: number;
            userId: number;
            title?: string;
            contextType: 'general' | 'academic' | 'administrative' | 'support';
            schoolId?: number;
            classId?: number;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          };
          messages: Array<{
            id: number;
            conversationId: number;
            role: 'user' | 'assistant' | 'system';
            content: string;
            metadata?: any;
            createdAt: string;
          }>;
        };
      };
      create: {
        input: {
          title?: string;
          contextType?: 'general' | 'academic' | 'administrative' | 'support';
          schoolId?: number;
          classId?: number;
        };
        output: {
          id: number;
          userId: number;
          title?: string;
          contextType: 'general' | 'academic' | 'administrative' | 'support';
          schoolId?: number;
          classId?: number;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
      delete: {
        input: { id: number };
        output: { success: boolean };
      };
    };
    prompts: {
      list: {
        input: {
          category?: string;
          isSystem?: boolean;
          search?: string;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          prompts: Array<{
            id: number;
            name: string;
            description?: string;
            promptText: string;
            category: string;
            variables?: string[];
            isSystem: boolean;
            isActive: boolean;
            createdBy: number;
            usageCount: number;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      get: {
        input: { id: number };
        output: {
          id: number;
          name: string;
          description?: string;
          promptText: string;
          category: string;
          variables?: string[];
          isSystem: boolean;
          isActive: boolean;
          createdBy: number;
          usageCount: number;
          createdAt: string;
          updatedAt: string;
        };
      };
      create: {
        input: {
          name: string;
          description?: string;
          promptText: string;
          category: string;
          variables?: string[];
          isSystem?: boolean;
        };
        output: {
          id: number;
          name: string;
          description?: string;
          promptText: string;
          category: string;
          variables?: string[];
          isSystem: boolean;
          isActive: boolean;
          createdBy: number;
          usageCount: number;
          createdAt: string;
          updatedAt: string;
        };
      };
      update: {
        input: {
          id: number;
          name?: string;
          description?: string;
          promptText?: string;
          category?: string;
          variables?: string[];
          isSystem?: boolean;
          isActive?: boolean;
        };
        output: {
          id: number;
          name: string;
          description?: string;
          promptText: string;
          category: string;
          variables?: string[];
          isSystem: boolean;
          isActive: boolean;
          createdBy: number;
          usageCount: number;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    models: {
      list: {
        input: {
          provider?: 'openrouter' | 'ollama' | 'all';
        };
        output: {
          models: Array<{
            id: string;
            name: string;
            provider: string;
            pricing?: any;
          }>;
        };
      };
      status: {
        input: void;
        output: {
          providers: Array<{
            name: string;
            status: 'online' | 'offline' | 'error';
            responseTime: number;
            lastChecked: string;
            modelCount: number;
          }>;
        };
      };
    };
    usage: {
      stats: {
        input: {
          startDate?: string;
          endDate?: string;
          provider?: 'openrouter' | 'ollama' | 'gemini';
          schoolId?: number;
        };
        output: {
          totalRequests: number;
          totalTokens: number;
          totalCost: number;
          byProvider: Array<{
            provider: string;
            requests: number;
            tokens: number;
            cost: number;
          }>;
          byDay: Array<{
            date: string;
            requests: number;
            tokens: number;
            cost: number;
          }>;
        };
      };
      history: {
        input: {
          provider?: 'openrouter' | 'ollama' | 'gemini';
          requestType?: 'chat' | 'completion' | 'embedding';
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          usage: Array<{
            id: number;
            userId: number;
            modelName: string;
            provider: 'openrouter' | 'ollama' | 'gemini';
            tokensUsed: number;
            cost: number;
            requestType: 'chat' | 'completion' | 'embedding';
            schoolId?: number;
            createdAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
    };
  };
  schoolHub: {
    courses: {
      list: {
        input: {
          schoolId?: number;
          subject?: string;
          gradeLevel?: string;
          search?: string;
          isActive?: boolean;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          courses: Array<{
            id: number;
            schoolId: number;
            name: string;
            code: string;
            description?: string;
            credits: number;
            gradeLevel?: string;
            subject: string;
            department?: string;
            prerequisites?: string[];
            syllabusUrl?: string;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      get: {
        input: { id: number };
        output: {
          id: number;
          schoolId: number;
          name: string;
          code: string;
          description?: string;
          credits: number;
          gradeLevel?: string;
          subject: string;
          department?: string;
          prerequisites?: string[];
          syllabusUrl?: string;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
      create: {
        input: {
          schoolId: number;
          name: string;
          code: string;
          description?: string;
          credits: number;
          gradeLevel?: string;
          subject: string;
          department?: string;
          prerequisites?: string[];
          syllabusUrl?: string;
        };
        output: {
          id: number;
          schoolId: number;
          name: string;
          code: string;
          description?: string;
          credits: number;
          gradeLevel?: string;
          subject: string;
          department?: string;
          prerequisites?: string[];
          syllabusUrl?: string;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    classes: {
      list: {
        input: {
          courseId?: number;
          teacherId?: number;
          semester?: string;
          academicYear?: string;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          classes: Array<{
            id: number;
            courseId: number;
            teacherId: number;
            section: string;
            roomNumber?: string;
            schedule?: any;
            maxStudents: number;
            currentEnrollment: number;
            semester: string;
            academicYear: string;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      create: {
        input: {
          courseId: number;
          teacherId: number;
          section: string;
          roomNumber?: string;
          schedule?: any;
          maxStudents: number;
          semester: string;
          academicYear: string;
        };
        output: {
          id: number;
          courseId: number;
          teacherId: number;
          section: string;
          roomNumber?: string;
          schedule?: any;
          maxStudents: number;
          currentEnrollment: number;
          semester: string;
          academicYear: string;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    assignments: {
      list: {
        input: {
          classId?: number;
          assignmentType?: 'homework' | 'quiz' | 'exam' | 'project' | 'essay' | 'lab';
          isPublished?: boolean;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          assignments: Array<{
            id: number;
            classId: number;
            title: string;
            description?: string;
            assignmentType: 'homework' | 'quiz' | 'exam' | 'project' | 'essay' | 'lab';
            totalPoints: number;
            dueDate?: string;
            instructions?: string;
            attachments?: string[];
            isPublished: boolean;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      create: {
        input: {
          classId: number;
          title: string;
          description?: string;
          assignmentType: 'homework' | 'quiz' | 'exam' | 'project' | 'essay' | 'lab';
          totalPoints: number;
          dueDate?: string;
          instructions?: string;
          attachments?: string[];
          isPublished?: boolean;
        };
        output: {
          id: number;
          classId: number;
          title: string;
          description?: string;
          assignmentType: 'homework' | 'quiz' | 'exam' | 'project' | 'essay' | 'lab';
          totalPoints: number;
          dueDate?: string;
          instructions?: string;
          attachments?: string[];
          isPublished: boolean;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    submissions: {
      list: {
        input: {
          assignmentId?: number;
          studentId?: number;
          status?: 'draft' | 'submitted' | 'graded' | 'returned';
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          submissions: Array<{
            id: number;
            assignmentId: number;
            studentId: number;
            content?: string;
            attachments?: string[];
            submittedAt: string;
            status: 'draft' | 'submitted' | 'graded' | 'returned';
            score?: number;
            feedback?: string;
            gradedAt?: string;
            gradedBy?: number;
            isLate: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      create: {
        input: {
          assignmentId: number;
          content?: string;
          attachments?: string[];
          status?: 'draft' | 'submitted';
        };
        output: {
          id: number;
          assignmentId: number;
          studentId: number;
          content?: string;
          attachments?: string[];
          submittedAt: string;
          status: 'draft' | 'submitted' | 'graded' | 'returned';
          score?: number;
          feedback?: string;
          gradedAt?: string;
          gradedBy?: number;
          isLate: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
      grade: {
        input: {
          submissionId: number;
          score: number;
          feedback?: string;
        };
        output: {
          id: number;
          assignmentId: number;
          studentId: number;
          content?: string;
          attachments?: string[];
          submittedAt: string;
          status: 'draft' | 'submitted' | 'graded' | 'returned';
          score?: number;
          feedback?: string;
          gradedAt?: string;
          gradedBy?: number;
          isLate: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    enrollments: {
      list: {
        input: {
          studentId?: number;
          classId?: number;
          status?: 'enrolled' | 'dropped' | 'completed' | 'withdrawn';
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          enrollments: Array<{
            id: number;
            studentId: number;
            classId: number;
            enrollmentDate: string;
            status: 'enrolled' | 'dropped' | 'completed' | 'withdrawn';
            finalGrade?: string;
            gradePoints?: number;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      create: {
        input: {
          studentId: number;
          classId: number;
        };
        output: {
          id: number;
          studentId: number;
          classId: number;
          enrollmentDate: string;
          status: 'enrolled' | 'dropped' | 'completed' | 'withdrawn';
          finalGrade?: string;
          gradePoints?: number;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
  };
  crm: {
    contacts: {
      list: {
        input: {
          contactType?: 'lead' | 'customer' | 'partner' | 'vendor';
          search?: string;
          company?: string;
          source?: string;
          isActive?: boolean;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          contacts: Array<{
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
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      get: {
        input: { id: number };
        output: {
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
          createdAt: string;
          updatedAt: string;
        };
      };
      create: {
        input: {
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
        };
        output: {
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
          createdAt: string;
          updatedAt: string;
        };
      };
      update: {
        input: {
          id: number;
          firstName?: string;
          lastName?: string;
          email?: string;
          phone?: string;
          company?: string;
          jobTitle?: string;
          address?: string;
          city?: string;
          state?: string;
          country?: string;
          postalCode?: string;
          contactType?: 'lead' | 'customer' | 'partner' | 'vendor';
          source?: string;
          tags?: string[];
          notes?: string;
          isActive?: boolean;
        };
        output: {
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
          createdAt: string;
          updatedAt: string;
        };
      };
      delete: {
        input: { id: number };
        output: { success: boolean };
      };
    };
    leads: {
      list: {
        input: {
          status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
          assignedTo?: number;
          source?: string;
          minScore?: number;
          maxScore?: number;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          leads: Array<{
            id: number;
            contactId: number;
            status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
            score: number;
            source?: string;
            campaign?: string;
            estimatedValue?: number;
            probability: number;
            expectedCloseDate?: string;
            assignedTo?: number;
            lastActivityDate?: string;
            notes?: string;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      create: {
        input: {
          contactId: number;
          status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
          score?: number;
          source?: string;
          campaign?: string;
          estimatedValue?: number;
          probability?: number;
          expectedCloseDate?: string;
          assignedTo?: number;
          notes?: string;
        };
        output: {
          id: number;
          contactId: number;
          status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
          score: number;
          source?: string;
          campaign?: string;
          estimatedValue?: number;
          probability: number;
          expectedCloseDate?: string;
          assignedTo?: number;
          lastActivityDate?: string;
          notes?: string;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    accounts: {
      list: {
        input: {
          accountType?: 'school' | 'district' | 'organization' | 'individual';
          status?: 'active' | 'inactive' | 'prospect' | 'customer';
          size?: 'small' | 'medium' | 'large' | 'enterprise';
          search?: string;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          accounts: Array<{
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
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      create: {
        input: {
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
          status?: 'active' | 'inactive' | 'prospect' | 'customer';
          tags?: string[];
          notes?: string;
        };
        output: {
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
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    deals: {
      list: {
        input: {
          stage?: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
          ownerId?: number;
          accountId?: number;
          minAmount?: number;
          maxAmount?: number;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          deals: Array<{
            id: number;
            name: string;
            accountId: number;
            contactId?: number;
            stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
            amount: number;
            probability: number;
            expectedCloseDate?: string;
            actualCloseDate?: string;
            ownerId: number;
            source?: string;
            description?: string;
            nextStep?: string;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
          summary: {
            totalValue: number;
            averageValue: number;
            winRate: number;
            totalDeals: number;
          };
        };
      };
      create: {
        input: {
          name: string;
          accountId: number;
          contactId?: number;
          stage?: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
          amount: number;
          probability?: number;
          expectedCloseDate?: string;
          source?: string;
          description?: string;
          nextStep?: string;
        };
        output: {
          id: number;
          name: string;
          accountId: number;
          contactId?: number;
          stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
          amount: number;
          probability: number;
          expectedCloseDate?: string;
          actualCloseDate?: string;
          ownerId: number;
          source?: string;
          description?: string;
          nextStep?: string;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    campaigns: {
      list: {
        input: {
          campaignType?: 'email' | 'sms' | 'social' | 'webinar' | 'event' | 'direct_mail';
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          ownerId?: number;
          page?: number;
          limit?: number;
          offset?: number;
        };
        output: {
          campaigns: Array<{
            id: number;
            name: string;
            campaignType: 'email' | 'sms' | 'social' | 'webinar' | 'event' | 'direct_mail';
            status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
            startDate?: string;
            endDate?: string;
            budget?: number;
            targetAudience?: string;
            description?: string;
            goals?: string;
            ownerId: number;
            metrics?: any;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
          }>;
          total: number;
          hasMore: boolean;
        };
      };
      create: {
        input: {
          name: string;
          campaignType: 'email' | 'sms' | 'social' | 'webinar' | 'event' | 'direct_mail';
          startDate?: string;
          endDate?: string;
          budget?: number;
          targetAudience?: string;
          description?: string;
          goals?: string;
        };
        output: {
          id: number;
          name: string;
          campaignType: 'email' | 'sms' | 'social' | 'webinar' | 'event' | 'direct_mail';
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          startDate?: string;
          endDate?: string;
          budget?: number;
          targetAudience?: string;
          description?: string;
          goals?: string;
          ownerId: number;
          metrics?: any;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
    analytics: {
      dashboard: {
        input: {
          startDate?: string;
          endDate?: string;
        };
        output: {
          totalContacts: number;
          totalLeads: number;
          totalDeals: number;
          totalRevenue: number;
          conversionRate: number;
          averageDealSize: number;
          activeCampaigns: number;
          recentActivity: Array<{
            type: string;
            description: string;
            timestamp: string;
          }>;
        };
      };
    };
  };
} & {
  // Required by tRPC
  _def: any;
  createCaller: any;
};