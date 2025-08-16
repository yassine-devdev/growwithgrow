import { securityConfig } from './config';
import { SecurityContext, SecurityViolation, SecurityViolationType } from './types';

export class CorsHandler {
  private config = securityConfig.cors;
  
  // Check if origin is allowed
  isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) {
      // Allow requests without origin (e.g., mobile apps, Postman)
      return true;
    }
    
    // Check against allowed origins
    return this.config.origins.includes(origin) || this.config.origins.includes('*');
  }
  
  // Generate CORS headers
  generateCorsHeaders(origin: string | undefined): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Set Access-Control-Allow-Origin
    if (this.isOriginAllowed(origin)) {
      headers['Access-Control-Allow-Origin'] = origin || '*';
    } else {
      headers['Access-Control-Allow-Origin'] = 'null';
    }
    
    // Set other CORS headers
    headers['Access-Control-Allow-Methods'] = this.config.methods.join(', ');
    headers['Access-Control-Allow-Headers'] = this.config.allowedHeaders.join(', ');
    headers['Access-Control-Allow-Credentials'] = this.config.credentials.toString();
    headers['Access-Control-Max-Age'] = this.config.maxAge.toString();
    
    return headers;
  }
  
  // Handle preflight OPTIONS request
  handlePreflight(origin: string | undefined): {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  } {
    const headers = this.generateCorsHeaders(origin);
    
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // Validate CORS request and generate violation if needed
  validateCorsRequest(context: SecurityContext): {
    allowed: boolean;
    headers: Record<string, string>;
    violation?: SecurityViolation;
  } {
    const headers = this.generateCorsHeaders(context.origin);
    
    if (!this.isOriginAllowed(context.origin)) {
      const violation: SecurityViolation = {
        type: SecurityViolationType.INVALID_ORIGIN,
        ip: context.ip,
        userAgent: context.userAgent,
        details: {
          origin: context.origin,
          allowedOrigins: this.config.origins
        },
        timestamp: context.timestamp,
        severity: 'medium'
      };
      
      return {
        allowed: false,
        headers,
        violation
      };
    }
    
    return {
      allowed: true,
      headers
    };
  }
  
  // Check if request method is allowed
  isMethodAllowed(method: string): boolean {
    return this.config.methods.includes(method.toUpperCase());
  }
  
  // Check if header is allowed
  isHeaderAllowed(header: string): boolean {
    return this.config.allowedHeaders.some(
      allowedHeader => allowedHeader.toLowerCase() === header.toLowerCase()
    );
  }
  
  // Validate all request headers
  validateHeaders(headers: Record<string, string>): {
    valid: boolean;
    invalidHeaders: string[];
  } {
    const invalidHeaders: string[] = [];
    
    // Check each header against allowed list
    Object.keys(headers).forEach(header => {
      // Skip standard headers that are always allowed
      const standardHeaders = [
        'accept',
        'accept-language',
        'content-language',
        'content-type',
        'origin',
        'referer',
        'user-agent',
        'host',
        'connection',
        'cache-control',
        'pragma'
      ];
      
      if (!standardHeaders.includes(header.toLowerCase()) && !this.isHeaderAllowed(header)) {
        invalidHeaders.push(header);
      }
    });
    
    return {
      valid: invalidHeaders.length === 0,
      invalidHeaders
    };
  }
}

// Export singleton instance
export const corsHandler = new CorsHandler();