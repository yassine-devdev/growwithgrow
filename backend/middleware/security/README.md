# Security Middleware Stack

This directory contains a comprehensive security middleware stack for the Grow Your Need SaaS backend, implementing multiple layers of security protection.

## Overview

The security middleware provides:
- **CORS Configuration**: Environment-specific origin validation
- **Rate Limiting**: 100 requests per minute per IP address
- **Security Headers**: Helmet.js integration with CSP, HSTS, X-Frame-Options
- **Input Sanitization**: XSS prevention and input cleaning
- **Request Validation**: Zod schema-based validation

## Components

### 1. CORS Handler (`cors.ts`)
- Environment-specific origin validation
- Preflight request handling
- Secure header configuration
- Invalid origin detection and blocking

### 2. Rate Limiter (`rate-limiter.ts`)
- In-memory rate limiting (Redis-ready for production)
- Per-IP request tracking
- Configurable windows and limits
- Automatic cleanup of expired entries

### 3. Helmet Handler (`helmet.ts`)
- Content Security Policy (CSP) configuration
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options, X-Content-Type-Options
- Referrer Policy and other security headers

### 4. Input Sanitizer (`sanitizer.ts`)
- HTML sanitization using DOMPurify
- XSS pattern detection
- Recursive object sanitization
- Configurable sanitization rules

### 5. Request Validator (`validator.ts`)
- Zod schema validation
- Common validation schemas (email, password, etc.)
- Request body and query parameter validation
- File upload validation

### 6. Security Configuration (`config.ts`)
- Environment-specific configurations
- Development, staging, and production settings
- Centralized security policy management

## Usage

### Basic Integration

```typescript
import { SecurityMiddleware } from './middleware/security';

// Apply security middleware to request
const securityResult = await SecurityMiddleware.applySecurityMiddleware(req, res);

if (!securityResult.allowed) {
  return {
    statusCode: securityResult.statusCode || 403,
    headers: securityResult.headers,
    body: securityResult.body
  };
}
```

### tRPC Integration

The security middleware is automatically integrated with tRPC through the adapter:

```typescript
// In trpc/adapter.ts
import { SecurityMiddleware } from '../middleware/security';

// Security middleware is applied before tRPC processing
const securityResult = await SecurityMiddleware.applySecurityMiddleware(req, null);
```

### Individual Component Usage

```typescript
// CORS validation
import { corsHandler } from './middleware/security';
const corsResult = corsHandler.validateCorsRequest(context);

// Rate limiting
import { rateLimiter } from './middleware/security';
const rateLimitResult = await rateLimiter.checkRateLimit(context);

// Input sanitization
import { sanitizeObject } from './middleware/security';
const cleanData = sanitizeObject(userInput);

// Request validation
import { validateBody, CommonSchemas } from './middleware/security';
const validationResult = validateBody(data, CommonSchemas.email, context);
```

## Configuration

### Environment Variables

```bash
# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Node Environment
NODE_ENV=development|staging|production
```

### Security Policies by Environment

#### Development
- Relaxed CORS (localhost origins)
- Higher rate limits (1000 req/min)
- Lenient CSP with unsafe-inline and unsafe-eval
- Disabled HSTS

#### Staging
- Staging domain + localhost origins
- Moderate rate limits (200 req/min)
- Standard security headers
- HSTS enabled

#### Production
- Production domains only
- Strict rate limits (100 req/min)
- Strict CSP without unsafe directives
- Full HSTS with preload

## Security Features

### 1. CORS Protection
- ✅ Environment-specific origin validation
- ✅ Preflight request handling
- ✅ Credential support configuration
- ✅ Method and header validation

### 2. Rate Limiting
- ✅ Per-IP request tracking
- ✅ Configurable time windows
- ✅ Automatic cleanup
- ✅ Rate limit headers

### 3. Security Headers
- ✅ Content Security Policy (CSP)
- ✅ HTTP Strict Transport Security (HSTS)
- ✅ X-Frame-Options (Clickjacking protection)
- ✅ X-Content-Type-Options (MIME sniffing protection)
- ✅ X-XSS-Protection
- ✅ Referrer Policy
- ✅ Permissions Policy

### 4. Input Sanitization
- ✅ HTML sanitization with DOMPurify
- ✅ XSS pattern detection
- ✅ Recursive object cleaning
- ✅ Script tag removal
- ✅ Event handler removal

### 5. Request Validation
- ✅ Zod schema validation
- ✅ Type-safe input validation
- ✅ Common validation patterns
- ✅ File upload validation
- ✅ Query parameter transformation

## Security Violations

The middleware tracks and logs security violations:

```typescript
interface SecurityViolation {
  type: SecurityViolationType;
  ip: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
```

Violation types:
- `RATE_LIMIT_EXCEEDED`
- `INVALID_ORIGIN`
- `XSS_ATTEMPT`
- `INVALID_INPUT`
- `CSRF_TOKEN_MISSING`
- `SUSPICIOUS_REQUEST`

## Testing

Run the security validation:

```bash
# Basic functionality test
node test-security.js

# Full test suite (when available)
npm test middleware/security/security.test.ts
```

## Production Considerations

### Rate Limiting Store
The current implementation uses in-memory storage. For production, replace with Redis:

```typescript
import Redis from 'ioredis';

class RedisRateLimitStore implements RateLimitStore {
  constructor(private redis: Redis) {}
  
  async get(key: string): Promise<number | null> {
    const value = await this.redis.get(key);
    return value ? parseInt(value, 10) : null;
  }
  
  // ... implement other methods
}
```

### Monitoring Integration
Integrate with monitoring services:

```typescript
// In SecurityLogger
static logViolation(violation: SecurityViolation): void {
  // Send to Sentry, DataDog, CloudWatch, etc.
  Sentry.captureException(new Error('Security Violation'), {
    tags: { type: violation.type, severity: violation.severity },
    extra: violation
  });
}
```

### CSP Nonce Generation
For stricter CSP, use nonces:

```typescript
const nonce = helmetHandler.generateNonce();
const headersWithNonce = helmetHandler.updateCSPWithNonce(nonce);
```

## Dependencies

- `helmet`: Security headers
- `dompurify`: HTML sanitization
- `jsdom`: DOM implementation for DOMPurify
- `zod`: Schema validation
- `express-rate-limit`: Rate limiting utilities

## Security Best Practices

1. **Regular Updates**: Keep all security dependencies updated
2. **Environment Separation**: Use different configs for dev/staging/prod
3. **Monitoring**: Log and monitor security violations
4. **Testing**: Regularly test security measures
5. **Documentation**: Keep security policies documented
6. **Incident Response**: Have a plan for security incidents

## Contributing

When adding new security features:

1. Add comprehensive tests
2. Update configuration schemas
3. Document new violation types
4. Update environment-specific configs
5. Test in all environments