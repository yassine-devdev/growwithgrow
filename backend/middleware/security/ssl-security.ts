import { SecurityContext, SecurityViolation, SecurityViolationType } from './types';

export interface SSLSecurityConfig {
  enforceHttps: boolean;
  hstsMaxAge: number;
  hstsIncludeSubdomains: boolean;
  hstsPreload: boolean;
  requireSecureHeaders: boolean;
  allowedTlsVersions: string[];
  cipherSuites: string[];
}

export class SSLSecurityHandler {
  private config: SSLSecurityConfig;

  constructor(config?: Partial<SSLSecurityConfig>) {
    this.config = {
      enforceHttps: process.env.NODE_ENV === 'production',
      hstsMaxAge: 31536000, // 1 year
      hstsIncludeSubdomains: true,
      hstsPreload: true,
      requireSecureHeaders: true,
      allowedTlsVersions: ['TLSv1.2', 'TLSv1.3'],
      cipherSuites: [
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-CHACHA20-POLY1305',
        'ECDHE-RSA-CHACHA20-POLY1305'
      ],
      ...config
    };
  }

  // Generate HSTS header
  generateHSTSHeader(): string {
    let hsts = `max-age=${this.config.hstsMaxAge}`;
    
    if (this.config.hstsIncludeSubdomains) {
      hsts += '; includeSubDomains';
    }
    
    if (this.config.hstsPreload) {
      hsts += '; preload';
    }
    
    return hsts;
  }

  // Generate SSL security headers
  generateSSLSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.enforceHttps) {
      headers['Strict-Transport-Security'] = this.generateHSTSHeader();
    }

    // Enhanced security headers for HTTPS
    headers['X-Frame-Options'] = 'DENY';
    headers['X-Content-Type-Options'] = 'nosniff';
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    
    // Content Security Policy with HTTPS enforcement
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' wss: https:",
      "media-src 'self'",
      "object-src 'none'",
      "child-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    // Permissions Policy
    headers['Permissions-Policy'] = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'fullscreen=(self)'
    ].join(', ');

    // Cross-Origin policies
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = 'same-origin';

    return headers;
  }

  // Validate SSL/TLS connection
  validateSSLConnection(req: any): {
    valid: boolean;
    violations: SecurityViolation[];
    headers: Record<string, string>;
  } {
    const violations: SecurityViolation[] = [];
    const context: SecurityContext = {
      ip: req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || 
          req.headers?.['x-real-ip'] || 
          req.connection?.remoteAddress || 
          'unknown',
      userAgent: req.headers?.['user-agent'],
      origin: req.headers?.origin,
      requestId: req.headers?.['x-request-id'] || `req_${Date.now()}`,
      timestamp: new Date()
    };

    // Check if HTTPS is enforced
    if (this.config.enforceHttps) {
      const isSecure = req.secure || 
                      req.headers['x-forwarded-proto'] === 'https' ||
                      req.headers['x-forwarded-ssl'] === 'on';

      if (!isSecure) {
        violations.push({
          type: SecurityViolationType.INSECURE_CONNECTION,
          ip: context.ip,
          userAgent: context.userAgent,
          details: {
            protocol: req.headers['x-forwarded-proto'] || 'http',
            secure: req.secure,
            headers: {
              'x-forwarded-proto': req.headers['x-forwarded-proto'],
              'x-forwarded-ssl': req.headers['x-forwarded-ssl']
            }
          },
          timestamp: context.timestamp,
          severity: 'high'
        });
      }
    }

    // Validate TLS version if available
    const tlsVersion = req.connection?.getProtocol?.();
    if (tlsVersion && !this.config.allowedTlsVersions.includes(tlsVersion)) {
      violations.push({
        type: SecurityViolationType.WEAK_ENCRYPTION,
        ip: context.ip,
        userAgent: context.userAgent,
        details: {
          tlsVersion,
          allowedVersions: this.config.allowedTlsVersions
        },
        timestamp: context.timestamp,
        severity: 'medium'
      });
    }

    // Check for secure headers in request
    if (this.config.requireSecureHeaders) {
      const requiredHeaders = ['x-forwarded-proto'];
      const missingHeaders = requiredHeaders.filter(header => !req.headers[header]);
      
      if (missingHeaders.length > 0) {
        violations.push({
          type: SecurityViolationType.MISSING_SECURITY_HEADERS,
          ip: context.ip,
          userAgent: context.userAgent,
          details: {
            missingHeaders,
            requiredHeaders
          },
          timestamp: context.timestamp,
          severity: 'low'
        });
      }
    }

    return {
      valid: violations.length === 0,
      violations,
      headers: this.generateSSLSecurityHeaders()
    };
  }

  // Check certificate validity (for monitoring)
  async checkCertificateHealth(domain: string): Promise<{
    valid: boolean;
    expiresAt?: Date;
    daysUntilExpiry?: number;
    issuer?: string;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      const https = require('https');
      const { promisify } = require('util');
      
      return new Promise((resolve) => {
        const options = {
          hostname: domain,
          port: 443,
          method: 'GET',
          timeout: 5000
        };

        const req = https.request(options, (res: any) => {
          const cert = res.connection.getPeerCertificate();
          
          if (!cert || Object.keys(cert).length === 0) {
            errors.push('No certificate found');
            return resolve({ valid: false, errors });
          }

          const expiresAt = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilExpiry < 0) {
            errors.push('Certificate has expired');
          } else if (daysUntilExpiry < 30) {
            errors.push(`Certificate expires in ${daysUntilExpiry} days`);
          }

          resolve({
            valid: errors.length === 0,
            expiresAt,
            daysUntilExpiry,
            issuer: cert.issuer?.CN || 'Unknown',
            errors
          });
        });

        req.on('error', (error: Error) => {
          errors.push(`Connection error: ${error.message}`);
          resolve({ valid: false, errors });
        });

        req.on('timeout', () => {
          errors.push('Connection timeout');
          req.destroy();
          resolve({ valid: false, errors });
        });

        req.end();
      });
    } catch (error) {
      errors.push(`Certificate check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { valid: false, errors };
    }
  }

  // Generate security report
  generateSecurityReport(req: any): {
    ssl: {
      enabled: boolean;
      version?: string;
      cipher?: string;
    };
    headers: Record<string, boolean>;
    violations: SecurityViolation[];
    recommendations: string[];
  } {
    const validation = this.validateSSLConnection(req);
    const recommendations: string[] = [];

    // SSL status
    const ssl = {
      enabled: req.secure || req.headers['x-forwarded-proto'] === 'https',
      version: req.connection?.getProtocol?.(),
      cipher: req.connection?.getCipher?.()?.name
    };

    if (!ssl.enabled) {
      recommendations.push('Enable HTTPS for all connections');
    }

    // Header analysis
    const securityHeaders = this.generateSSLSecurityHeaders();
    const headers: Record<string, boolean> = {};
    
    Object.keys(securityHeaders).forEach(header => {
      headers[header] = !!req.headers[header.toLowerCase()];
      if (!headers[header]) {
        recommendations.push(`Add ${header} security header`);
      }
    });

    // Additional recommendations
    if (ssl.version && !this.config.allowedTlsVersions.includes(ssl.version)) {
      recommendations.push(`Upgrade TLS version from ${ssl.version} to TLS 1.2 or 1.3`);
    }

    return {
      ssl,
      headers,
      violations: validation.violations,
      recommendations
    };
  }
}

// Export singleton instance
export const sslSecurityHandler = new SSLSecurityHandler();