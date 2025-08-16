import { z } from 'zod';

// Security configuration schema
export const SecurityConfigSchema = z.object({
  cors: z.object({
    origins: z.array(z.string()).default([
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost:3000',
      'https://localhost:5173'
    ]),
    credentials: z.boolean().default(true),
    methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']),
    allowedHeaders: z.array(z.string()).default([
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token'
    ]),
    maxAge: z.number().default(86400) // 24 hours
  }),
  rateLimit: z.object({
    windowMs: z.number().default(60 * 1000), // 1 minute
    max: z.number().default(100), // 100 requests per minute per IP
    skipSuccessfulRequests: z.boolean().default(false),
    skipFailedRequests: z.boolean().default(false),
    standardHeaders: z.boolean().default(true),
    legacyHeaders: z.boolean().default(false),
    message: z.string().default('Too many requests from this IP, please try again later.')
  }),
  helmet: z.object({
    contentSecurityPolicy: z.object({
      directives: z.object({
        defaultSrc: z.array(z.string()).default(["'self'"]),
        scriptSrc: z.array(z.string()).default(["'self'", "'unsafe-inline'"]),
        styleSrc: z.array(z.string()).default(["'self'", "'unsafe-inline'"]),
        imgSrc: z.array(z.string()).default(["'self'", "data:", "https:"]),
        connectSrc: z.array(z.string()).default(["'self'"]),
        fontSrc: z.array(z.string()).default(["'self'"]),
        objectSrc: z.array(z.string()).default(["'none'"]),
        mediaSrc: z.array(z.string()).default(["'self'"]),
        frameSrc: z.array(z.string()).default(["'none'"])
      })
    }),
    hsts: z.object({
      maxAge: z.number().default(31536000), // 1 year
      includeSubDomains: z.boolean().default(true),
      preload: z.boolean().default(true)
    }),
    noSniff: z.boolean().default(true),
    xssFilter: z.boolean().default(true),
    referrerPolicy: z.string().default('strict-origin-when-cross-origin'),
    frameguard: z.object({
      action: z.enum(['deny', 'sameorigin']).default('deny')
    })
  }),
  sanitization: z.object({
    enabled: z.boolean().default(true),
    allowedTags: z.array(z.string()).default([]),
    allowedAttributes: z.record(z.array(z.string())).default({}),
    stripIgnoreTag: z.boolean().default(true),
    stripIgnoreTagBody: z.array(z.string()).default(['script', 'style'])
  })
});

export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;

// Request context interface
export interface SecurityContext {
  ip: string;
  userAgent?: string;
  origin?: string;
  userId?: number;
  requestId: string;
  timestamp: Date;
}

// Rate limit store interface
export interface RateLimitStore {
  get(key: string): Promise<number | null>;
  set(key: string, value: number, ttl: number): Promise<void>;
  increment(key: string, ttl: number): Promise<number>;
  reset(key: string): Promise<void>;
}

// Security violation types
export enum SecurityViolationType {
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_ORIGIN = 'INVALID_ORIGIN',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  INVALID_INPUT = 'INVALID_INPUT',
  CSRF_TOKEN_MISSING = 'CSRF_TOKEN_MISSING',
  SUSPICIOUS_REQUEST = 'SUSPICIOUS_REQUEST',
  INSECURE_CONNECTION = 'INSECURE_CONNECTION',
  WEAK_ENCRYPTION = 'WEAK_ENCRYPTION',
  MISSING_SECURITY_HEADERS = 'MISSING_SECURITY_HEADERS',
  BLACKLISTED_IP = 'BLACKLISTED_IP',
  BOT_DETECTED = 'BOT_DETECTED'
}

export interface SecurityViolation {
  type: SecurityViolationType;
  ip: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}