# 🔧 Backend Development Rules - Cyberpunk Dashboard

## 🎯 tRPC SERVER ARCHITECTURE

### Server Structure
```typescript
// server/index.ts
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from './auth';

const prisma = new PrismaClient();

const t = initTRPC.context<{
  user?: { id: string; email: string; role: string };
}>().create();

// Middleware for authentication
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Protected procedure
const protectedProcedure = t.procedure.use(isAuthenticated);

// Public procedure
const publicProcedure = t.procedure;

export const appRouter = t.router({
  // Auth routes
  auth: t.router({
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        // Authentication logic
      }),
    
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
      }))
      .mutation(async ({ input }) => {
        // Registration logic
      }),
  }),

  // Dashboard routes
  dashboard: t.router({
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        // Get dashboard statistics
      }),
    
    getRecentActivity: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(10),
      }))
      .query(async ({ input }) => {
        // Get recent activity
      }),
  }),

  // CRM routes
  crm: t.router({
    getContacts: protectedProcedure
      .input(z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        // Get contacts with pagination
      }),
    
    createContact: protectedProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        company: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Create new contact
      }),
  }),

  // AI Integration routes
  ai: t.router({
    generateContent: protectedProcedure
      .input(z.object({
        prompt: z.string().min(1),
        type: z.enum(['text', 'image', 'chart']),
        useLocal: z.boolean().default(false),
        options: z.record(z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        // AI content generation with OpenRouter/Ollama
      }),
    
    getModels: protectedProcedure
      .query(async () => {
        // Get available AI models
        return await aiService.getAvailableModels();
      }),
    
    setModel: protectedProcedure
      .input(z.object({
        type: z.enum(['cloud', 'local']),
        modelName: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Set AI model preference
        if (input.type === 'cloud') {
          aiService.setCloudModel(input.modelName);
        } else {
          aiService.setLocalModel(input.modelName);
        }
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
```

## 🗄️ DATABASE SCHEMA

### Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  contacts    Contact[]
  deals       Deal[]
  activities  Activity[]
  settings    UserSettings?

  @@map("users")
}

model Contact {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  company   String?
  status    ContactStatus @default(LEAD)
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  deals     Deal[]
  activities Activity[]

  @@map("contacts")
}

model Deal {
  id          String   @id @default(cuid())
  title       String
  value       Decimal
  stage       DealStage @default(LEAD)
  probability Int      @default(10)
  expectedCloseDate DateTime?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  contactId String?
  contact   Contact? @relation(fields: [contactId], references: [id])

  @@map("deals")
}

model Activity {
  id        String       @id @default(cuid())
  type      ActivityType
  title     String
  description String?
  date      DateTime
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  // Relations
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  contactId String?
  contact   Contact? @relation(fields: [contactId], references: [id])

  @@map("activities")
}

model UserSettings {
  id        String   @id @default(cuid())
  theme     String   @default("cyberpunk")
  language  String   @default("en")
  timezone  String   @default("UTC")
  notifications Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}

// Enums
enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}

enum ContactStatus {
  LEAD
  PROSPECT
  CUSTOMER
  INACTIVE
}

enum DealStage {
  LEAD
  QUALIFIED
  PROPOSAL
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}

enum ActivityType {
  CALL
  EMAIL
  MEETING
  TASK
  NOTE
}
```

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Implementation
```typescript
// server/auth/jwt.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

### Authentication Middleware
```typescript
// server/middleware/auth.ts
import { TRPCError } from '@trpc/server';
import { verifyToken } from '../auth/jwt';

export const createAuthContext = async (req: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { user: undefined };
  }

  try {
    const payload = verifyToken(token);
    return { user: payload };
  } catch (error) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
};
```

## 🤖 AI INTEGRATION

### OpenRouter & Ollama Integration
```typescript
// server/services/ai.ts
import { OpenRouter } from 'openrouter';
import { Ollama } from 'ollama';

// OpenRouter for cloud-based AI models
const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Ollama for local AI models
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434',
});

export class AIService {
  private openrouterModel = 'anthropic/claude-3.5-sonnet'; // Default model
  private ollamaModel = 'llama3.2'; // Default local model

  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    useLocal?: boolean; // Choose between OpenRouter or Ollama
  }): Promise<string> {
    try {
      if (options?.useLocal) {
        return this.generateTextLocal(prompt, options);
      } else {
        return this.generateTextCloud(prompt, options);
      }
    } catch (error) {
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  private async generateTextCloud(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    const response = await openrouter.chat.completions.create({
      model: this.openrouterModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async generateTextLocal(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    const response = await ollama.chat({
      model: this.ollamaModel,
      messages: [{ role: 'user', content: prompt }],
      options: {
        num_predict: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
      },
    });

    return response.message?.content || '';
  }

  async generateImage(prompt: string, useLocal: boolean = false): Promise<string> {
    if (useLocal) {
      // Use Ollama for local image generation if supported
      const response = await ollama.generate({
        model: 'llava', // Image generation model
        prompt: prompt,
      });
      return response.response;
    } else {
      // Use OpenRouter for cloud image generation
      const response = await openrouter.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      });
      return response.data[0]?.url || '';
    }
  }

  async analyzeData(data: any[], analysisType: string, useLocal: boolean = false): Promise<any> {
    const prompt = `Analyze this data for ${analysisType}: ${JSON.stringify(data)}`;
    return this.generateText(prompt, { useLocal });
  }

  // Get available models
  async getAvailableModels(): Promise<{
    cloud: string[];
    local: string[];
  }> {
    try {
      const [cloudModels, localModels] = await Promise.all([
        openrouter.models.list(),
        ollama.list(),
      ]);

      return {
        cloud: cloudModels.data.map(model => model.id),
        local: localModels.models.map(model => model.name),
      };
    } catch (error) {
      console.error('Error fetching models:', error);
      return { cloud: [], local: [] };
    }
  }

  // Switch models
  setCloudModel(modelName: string): void {
    this.openrouterModel = modelName;
  }

  setLocalModel(modelName: string): void {
    this.ollamaModel = modelName;
  }
}

export const aiService = new AIService();
```

## 📊 DATA VALIDATION

### Zod Schemas
```typescript
// server/schemas/index.ts
import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
});

export const dealSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  value: z.number().positive('Value must be positive'),
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
  probability: z.number().min(0).max(100),
  expectedCloseDate: z.date().optional(),
  notes: z.string().optional(),
  contactId: z.string().optional(),
});

export const activitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'TASK', 'NOTE']),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  date: z.date(),
  contactId: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

## 🔄 ERROR HANDLING

### Custom Error Classes
```typescript
// server/errors/index.ts
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}
```

### Error Handler Middleware
```typescript
// server/middleware/errorHandler.ts
import { TRPCError } from '@trpc/server';
import { AppError } from '../errors';

export const errorHandler = (error: any) => {
  if (error instanceof AppError) {
    throw new TRPCError({
      code: error.statusCode === 400 ? 'BAD_REQUEST' :
            error.statusCode === 401 ? 'UNAUTHORIZED' :
            error.statusCode === 403 ? 'FORBIDDEN' :
            error.statusCode === 404 ? 'NOT_FOUND' :
            'INTERNAL_SERVER_ERROR',
      message: error.message,
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);
  
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
};
```

## 📈 PERFORMANCE OPTIMIZATION

### Database Optimization
```typescript
// server/utils/database.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database connection health check
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// Optimized queries with pagination
export const createPaginatedQuery = <T>(
  query: any,
  page: number,
  limit: number,
  search?: string
) => {
  const skip = (page - 1) * limit;
  
  return {
    data: query.skip(skip).take(limit),
    count: query.count(),
    pagination: {
      page,
      limit,
      totalPages: Math.ceil((query.count() as any) / limit),
    },
  };
};
```

### Caching Strategy
```typescript
// server/services/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export class CacheService {
  private defaultTTL = 3600; // 1 hour

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }
}

export const cacheService = new CacheService();
```

## 🧪 TESTING

### Unit Tests
```typescript
// server/__tests__/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { generateToken, verifyToken, hashPassword, comparePassword } from '../auth/jwt';

describe('Authentication', () => {
  it('should generate and verify JWT token', () => {
    const payload = { userId: '1', email: 'test@example.com', role: 'USER' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });

  it('should hash and compare passwords', async () => {
    const password = 'testpassword123';
    const hash = await hashPassword(password);
    const isValid = await comparePassword(password, hash);
    
    expect(isValid).toBe(true);
  });
});
```

### Integration Tests
```typescript
// server/__tests__/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from '../index';
import { prisma } from '../utils/database';

const server = createHTTPServer({
  router: appRouter,
  createContext: () => ({}),
});

describe('API Integration', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create and retrieve contacts', async () => {
    // Test contact creation and retrieval
  });
});
```

## 🔒 SECURITY

### Rate Limiting
```typescript
// server/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../services/cache';

export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.call(...args),
    }),
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.',
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests
});
```

### Input Sanitization
```typescript
// server/middleware/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};
```

## 📋 BACKEND CHECKLIST

### Core Features
- [ ] tRPC server with all endpoints
- [ ] Database schema and migrations
- [ ] Authentication system
- [ ] Authorization middleware
- [ ] Input validation with Zod
- [ ] Error handling and logging
- [ ] Rate limiting
- [ ] Caching strategy
- [ ] AI integration
- [ ] File upload handling

### Security
- [ ] JWT token management
- [ ] Password hashing
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CORS configuration
- [ ] Security headers
- [ ] Environment variables

### Performance
- [ ] Database optimization
- [ ] Query pagination
- [ ] Redis caching
- [ ] Connection pooling
- [ ] Response compression
- [ ] Health checks
- [ ] Monitoring setup

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] API tests
- [ ] Security tests
- [ ] Performance tests
- [ ] Error handling tests

### Production Ready
- [ ] Environment configuration
- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] Database backups
- [ ] Monitoring and alerting
- [ ] Logging strategy
- [ ] Documentation

Remember: Security, performance, and reliability are paramount for a production-ready backend.
