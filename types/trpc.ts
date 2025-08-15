// Type definitions for tRPC AppRouter
// This file provides type safety for the frontend without importing backend files

import { z } from 'zod';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Base schemas
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const UserRoleSchema = z.enum(['admin', 'teacher', 'student', 'parent']);

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  avatar: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Dashboard schemas
export const DashboardStatsSchema = z.object({
  totalUsers: z.number(),
  totalCourses: z.number(),
  totalRevenue: z.number(),
  activeUsers: z.number(),
});

// AI schemas
export const AIProviderSchema = z.enum(['openrouter', 'ollama', 'gemini']);

export const AIRequestSchema = z.object({
  prompt: z.string().min(1),
  systemInstruction: z.string().optional(),
  provider: AIProviderSchema.optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
});

export const AIResponseSchema = z.object({
  response: z.string(),
  provider: AIProviderSchema,
  model: z.string(),
  tokensUsed: z.number(),
  cost: z.number().optional(),
});

// Course schemas
export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  instructor: z.string(),
  price: z.number(),
  duration: z.number(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type definitions for the AppRouter
// This represents the structure of our tRPC router
// Note: This is a simplified type definition for frontend use
// In a real implementation, this would be generated from the backend router
export type AppRouter = {
  // Dashboard routes
  dashboard: {
    getStats: {
      input: void;
      output: z.infer<typeof DashboardStatsSchema>;
    };
    getRecentActivity: {
      input: z.infer<typeof PaginationSchema>;
      output: {
        items: Array<{
          id: string;
          type: string;
          description: string;
          timestamp: Date;
          user: z.infer<typeof UserSchema>;
        }>;
        total: number;
        hasMore: boolean;
      };
    };
  };

  // Core routes
  core: {
    getUsers: {
      input: z.infer<typeof PaginationSchema> & {
        role?: z.infer<typeof UserRoleSchema>;
        search?: string;
      };
      output: {
        items: Array<z.infer<typeof UserSchema>>;
        total: number;
        hasMore: boolean;
      };
    };
    createUser: {
      input: {
        email: string;
        name: string;
        role: z.infer<typeof UserRoleSchema>;
        password: string;
      };
      output: z.infer<typeof UserSchema>;
    };
  };

  // AI routes
  ai: {
    generateText: {
      input: z.infer<typeof AIRequestSchema>;
      output: z.infer<typeof AIResponseSchema>;
    };
    getProviderStatus: {
      input: void;
      output: {
        providers: Array<{
          name: z.infer<typeof AIProviderSchema>;
          status: 'online' | 'offline' | 'error';
          responseTime: number;
          lastChecked: Date;
        }>;
      };
    };
  };

  // School Hub routes
  schoolHub: {
    getCourses: {
      input: z.infer<typeof PaginationSchema> & {
        category?: string;
        level?: string;
        search?: string;
      };
      output: {
        items: Array<z.infer<typeof CourseSchema>>;
        total: number;
        hasMore: boolean;
      };
    };
    createCourse: {
      input: Omit<z.infer<typeof CourseSchema>, 'id' | 'createdAt' | 'updatedAt'>;
      output: z.infer<typeof CourseSchema>;
    };
  };

  // CRM routes
  crm: {
    getContacts: {
      input: z.infer<typeof PaginationSchema> & {
        search?: string;
        status?: string;
      };
      output: {
        items: Array<{
          id: string;
          name: string;
          email: string;
          phone: string;
          status: string;
          lastContact: Date;
          createdAt: Date;
        }>;
        total: number;
        hasMore: boolean;
      };
    };
  };

  // Health check
  health: {
    check: {
      input: void;
      output: {
        status: 'ok' | 'error';
        timestamp: Date;
        services: Record<string, 'healthy' | 'unhealthy'>;
      };
    };
  };
} & {
  _def: any;
  createCaller: any;
};

// Export types for use in components
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type AIRequest = z.infer<typeof AIRequestSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
export type AIProvider = z.infer<typeof AIProviderSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;