import { SecurityContext, SecurityViolation, SecurityViolationType } from './types';
import { securityConfig } from './config';
import { rateLimiter } from './rate-limiter';
import { corsHandler } from './cors';
import { helmetHandler } from './helmet';
import { validateBody, validateQuery, validateHeaders } from './validator';
import { sanitizeObject } from './sanitizer';
import { sslSecurityHandler } from './ssl-security';
import { DDoSProtectionHandler } from './ddos-protection';

// Security violation logger
class SecurityLogger {
  static logViolation(violation: SecurityViolation): void {
    console.warn('🚨 Security Violation Detected:', {
      type: violation.type,
      severity: violation.severity,
      ip: violation.ip,
      userAgent: violation.userAgent,
      details: violation.details,
      timestamp: violation.timestamp.toISOString()
    });
    
    // In production, this should send to monitoring service
    // Example: Sentry, DataDog, CloudWatch, etc.
  }
  
  static logSecurityEvent(event: string, context: SecurityContext, details?: any): void {
    console.info('🔒 Security Event:', {
      event,
      ip: context.ip,
      userAgent: context.userAgent,
      userId: context.userId,
      details,
      timestamp: context.timestamp.toISOString()
    });
  }
}

// Initialize DDoS protection (will be properly initialized with store)
let ddosProtectionHandler: DDoSProtectionHandler;

// Main security middleware class
export class SecurityMiddleware {
  // Create security context from request
  static createSecurityContext(req: any): SecurityContext {
    return {
      ip: req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 
          req.headers?.['x-real-ip'] || 
          req.connection?.remoteAddress || 
          'unknown',
      userAgent: req.headers?.['user-agent'],
      origin: req.headers?.origin,
      userId: req.user?.id,
      requestId: req.headers?.['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
  }
  
  // Apply all security middleware
  static async applySecurityMiddleware(req: any, res: any): Promise<{
    allowed: boolean;
    headers: Record<string, string>;
    violations: SecurityViolation[];
    statusCode?: number;
    body?: string;
  }> {
    const context = this.createSecurityContext(req);
    const violations: SecurityViolation[] = [];
    let headers: Record<string, string> = {};
    
    // Initialize DDoS protection if not already done
    if (!ddosProtectionHandler) {
      ddosProtectionHandler = new DDoSProtectionHandler(rateLimiter['store'] || rateLimiter);
    }
    
    try {
      // 1. SSL/TLS Security Check
      const sslValidation = sslSecurityHandler.validateSSLConnection(req);
      headers = { ...headers, ...sslValidation.headers };
      violations.push(...sslValidation.violations);

      // 2. DDoS Protection Check
      const ddosCheck = await ddosProtectionHandler.checkDDoSProtection(req, context);
      headers = { ...headers, ...ddosCheck.headers };
      violations.push(...ddosCheck.violations);

      if (!ddosCheck.allowed) {
        return {
          allowed: false,
          headers,
          violations,
          statusCode: 429,
          body: JSON.stringify({
            error: {
              message: 'Request blocked due to suspicious activity',
              code: 'DDOS_PROTECTION_TRIGGERED',
              retryAfter: Math.ceil((ddosCheck.blockDuration || 0) / 1000)
            }
          })
        };
      }

      // 3. Handle CORS
      if (req.method === 'OPTIONS') {
        const preflightResponse = corsHandler.handlePreflight(context.origin);
        return {
          allowed: true,
          headers: { ...headers, ...preflightResponse.headers },
          violations: [],
          statusCode: preflightResponse.statusCode,
          body: preflightResponse.body
        };
      }
      
      const corsResult = corsHandler.validateCorsRequest(context);
      headers = { ...headers, ...corsResult.headers };
      
      if (!corsResult.allowed && corsResult.violation) {
        violations.push(corsResult.violation);
        SecurityLogger.logViolation(corsResult.violation);
      }
      
      // 4. Apply security headers (Helmet)
      const securityHeaders = helmetHandler.generateSecurityHeaders();
      headers = { ...headers, ...securityHeaders };
      
      // 5. Rate limiting
      const rateLimitResult = await rateLimiter.checkRateLimit(context);
      
      // Add rate limit headers
      headers['X-RateLimit-Limit'] = securityConfig.rateLimit.max.toString();
      headers['X-RateLimit-Remaining'] = rateLimitResult.remaining.toString();
      headers['X-RateLimit-Reset'] = Math.floor(rateLimitResult.resetTime / 1000).toString();
      
      if (!rateLimitResult.allowed && rateLimitResult.violation) {
        violations.push(rateLimitResult.violation);
        SecurityLogger.logViolation(rateLimitResult.violation);
        
        return {
          allowed: false,
          headers,
          violations,
          statusCode: 429,
          body: JSON.stringify({
            error: {
              message: securityConfig.rateLimit.message,
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            }
          })
        };
      }
      
      // 6. Validate headers
      const headerValidation = validateHeaders(req.headers || {});
      if (!headerValidation.valid) {
        const violation: SecurityViolation = {
          type: SecurityViolationType.SUSPICIOUS_REQUEST,
          ip: context.ip,
          userAgent: context.userAgent,
          details: {
            missing: headerValidation.missing,
            suspicious: headerValidation.suspicious
          },
          timestamp: context.timestamp,
          severity: 'medium'
        };
        
        violations.push(violation);
        SecurityLogger.logViolation(violation);
      }
      
      // 7. Sanitize request body if present
      if (req.body && typeof req.body === 'object') {
        try {
          req.body = sanitizeObject(req.body);
        } catch (error) {
          const violation: SecurityViolation = {
            type: SecurityViolationType.INVALID_INPUT,
            ip: context.ip,
            userAgent: context.userAgent,
            details: {
              error: error instanceof Error ? error.message : 'Sanitization failed'
            },
            timestamp: context.timestamp,
            severity: 'high'
          };
          
          violations.push(violation);
          SecurityLogger.logViolation(violation);
          
          return {
            allowed: false,
            headers,
            violations,
            statusCode: 400,
            body: JSON.stringify({
              error: {
                message: 'Invalid request data',
                code: 'INVALID_INPUT'
              }
            })
          };
        }
      }
      
      // Log security event
      SecurityLogger.logSecurityEvent('request_processed', context, {
        method: req.method,
        url: req.url,
        violationsCount: violations.length
      });
      
      return {
        allowed: true,
        headers,
        violations
      };
      
    } catch (error) {
      console.error('Security middleware error:', error);
      
      const violation: SecurityViolation = {
        type: SecurityViolationType.SUSPICIOUS_REQUEST,
        ip: context.ip,
        userAgent: context.userAgent,
        details: {
          error: error instanceof Error ? error.message : 'Unknown security error'
        },
        timestamp: context.timestamp,
        severity: 'high'
      };
      
      violations.push(violation);
      SecurityLogger.logViolation(violation);
      
      return {
        allowed: false,
        headers: helmetHandler.generateSecurityHeaders(),
        violations,
        statusCode: 500,
        body: JSON.stringify({
          error: {
            message: 'Internal security error',
            code: 'SECURITY_ERROR'
          }
        })
      };
    }
  }
  
  // Middleware for tRPC context
  static async createTRPCSecurityContext(req: any) {
    const context = this.createSecurityContext(req);
    const securityResult = await this.applySecurityMiddleware(req, null);
    
    return {
      security: {
        context,
        violations: securityResult.violations,
        headers: securityResult.headers,
        allowed: securityResult.allowed
      }
    };
  }
}

// Export all security components
export * from './types';
export * from './config';
export * from './rate-limiter';
export * from './cors';
export * from './helmet';
export * from './validator';
export * from './sanitizer';
export * from './ssl-security';
export * from './ddos-protection';

// Export main middleware
export { SecurityLogger };

// Export convenience functions
export const applySecurityMiddleware = SecurityMiddleware.applySecurityMiddleware.bind(SecurityMiddleware);
export const createSecurityContext = SecurityMiddleware.createSecurityContext.bind(SecurityMiddleware);
export const createTRPCSecurityContext = SecurityMiddleware.createTRPCSecurityContext.bind(SecurityMiddleware);