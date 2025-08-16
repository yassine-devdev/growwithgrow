import { securityConfig } from './config';

export class HelmetHandler {
  private config = securityConfig.helmet;
  
  // Generate Content Security Policy header value
  private generateCSPHeader(): string {
    const directives = this.config.contentSecurityPolicy.directives;
    const cspParts: string[] = [];
    
    Object.entries(directives).forEach(([directive, sources]) => {
      // Convert camelCase to kebab-case
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      cspParts.push(`${kebabDirective} ${sources.join(' ')}`);
    });
    
    return cspParts.join('; ');
  }
  
  // Generate Strict-Transport-Security header value
  private generateHSTSHeader(): string {
    const hsts = this.config.hsts;
    let hstsValue = `max-age=${hsts.maxAge}`;
    
    if (hsts.includeSubDomains) {
      hstsValue += '; includeSubDomains';
    }
    
    if (hsts.preload) {
      hstsValue += '; preload';
    }
    
    return hstsValue;
  }
  
  // Generate all security headers
  generateSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Content Security Policy
    headers['Content-Security-Policy'] = this.generateCSPHeader();
    
    // Strict Transport Security (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production' && this.config.hsts.maxAge > 0) {
      headers['Strict-Transport-Security'] = this.generateHSTSHeader();
    }
    
    // X-Content-Type-Options
    if (this.config.noSniff) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }
    
    // X-XSS-Protection
    if (this.config.xssFilter) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }
    
    // Referrer Policy
    headers['Referrer-Policy'] = this.config.referrerPolicy;
    
    // X-Frame-Options
    headers['X-Frame-Options'] = this.config.frameguard.action.toUpperCase();
    
    // Additional security headers
    headers['X-Permitted-Cross-Domain-Policies'] = 'none';
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = 'same-origin';
    
    // Permissions Policy (formerly Feature Policy)
    headers['Permissions-Policy'] = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()'
    ].join(', ');
    
    return headers;
  }
  
  // Check if CSP violation occurred
  checkCSPViolation(request: any): {
    violation: boolean;
    details?: any;
  } {
    // This would typically be called by a CSP violation report endpoint
    // For now, we'll implement basic checks
    
    const userAgent = request.headers?.['user-agent'] || '';
    const contentType = request.headers?.['content-type'] || '';
    
    // Check for suspicious patterns that might indicate CSP bypass attempts
    const suspiciousPatterns = [
      /data:text\/html/i,
      /javascript:/i,
      /vbscript:/i,
      /data:application\/javascript/i
    ];
    
    const requestBody = request.body || '';
    const requestUrl = request.url || '';
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestBody) || pattern.test(requestUrl)) {
        return {
          violation: true,
          details: {
            pattern: pattern.toString(),
            userAgent,
            contentType,
            url: requestUrl
          }
        };
      }
    }
    
    return { violation: false };
  }
  
  // Validate that response headers are secure
  validateResponseHeaders(headers: Record<string, string>): {
    secure: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check for required security headers
    const requiredHeaders = [
      'Content-Security-Policy',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy'
    ];
    
    requiredHeaders.forEach(header => {
      if (!headers[header]) {
        issues.push(`Missing required security header: ${header}`);
      }
    });
    
    // Check for insecure header values
    if (headers['X-Frame-Options'] && 
        !['DENY', 'SAMEORIGIN'].includes(headers['X-Frame-Options'].toUpperCase())) {
      issues.push('X-Frame-Options should be DENY or SAMEORIGIN');
    }
    
    if (headers['X-Content-Type-Options'] && 
        headers['X-Content-Type-Options'].toLowerCase() !== 'nosniff') {
      issues.push('X-Content-Type-Options should be nosniff');
    }
    
    // Check CSP header
    if (headers['Content-Security-Policy']) {
      const csp = headers['Content-Security-Policy'];
      if (csp.includes("'unsafe-eval'") && process.env.NODE_ENV === 'production') {
        issues.push("CSP contains 'unsafe-eval' in production");
      }
      if (csp.includes("'unsafe-inline'") && process.env.NODE_ENV === 'production') {
        issues.push("CSP contains 'unsafe-inline' in production - consider using nonces");
      }
    }
    
    return {
      secure: issues.length === 0,
      issues
    };
  }
  
  // Generate nonce for CSP
  generateNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
  }
  
  // Update CSP with nonce
  updateCSPWithNonce(nonce: string): Record<string, string> {
    const headers = this.generateSecurityHeaders();
    const currentCSP = headers['Content-Security-Policy'];
    
    // Add nonce to script-src and style-src
    const updatedCSP = currentCSP
      .replace(/script-src ([^;]+)/, `script-src $1 'nonce-${nonce}'`)
      .replace(/style-src ([^;]+)/, `style-src $1 'nonce-${nonce}'`);
    
    headers['Content-Security-Policy'] = updatedCSP;
    return headers;
  }
}

// Export singleton instance
export const helmetHandler = new HelmetHandler();