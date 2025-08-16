import { SecurityContext, SecurityViolation, SecurityViolationType, RateLimitStore } from './types';

export interface DDoSProtectionConfig {
  enabled: boolean;
  maxRequestsPerMinute: number;
  maxRequestsPerHour: number;
  maxConnectionsPerIP: number;
  suspiciousThreshold: number;
  blockDuration: number; // in milliseconds
  whitelistedIPs: string[];
  blacklistedIPs: string[];
  enableGeoBlocking: boolean;
  blockedCountries: string[];
  enableBotDetection: boolean;
  rateLimitByEndpoint: Record<string, number>;
}

export interface DDoSMetrics {
  totalRequests: number;
  blockedRequests: number;
  suspiciousRequests: number;
  uniqueIPs: number;
  topIPs: Array<{ ip: string; requests: number }>;
  topUserAgents: Array<{ userAgent: string; requests: number }>;
  attackPatterns: Array<{ pattern: string; count: number }>;
}

export class DDoSProtectionHandler {
  private config: DDoSProtectionConfig;
  private store: RateLimitStore;
  private metrics: DDoSMetrics;
  private blockedIPs: Map<string, number> = new Map(); // IP -> unblock timestamp
  private suspiciousPatterns: RegExp[] = [
    /sqlmap|nikto|nmap|masscan|nessus|burp|owasp/i,
    /union.*select|insert.*into|delete.*from|drop.*table/i,
    /<script|javascript:|vbscript:|onload=|onerror=/i,
    /\.\./,
    /\/etc\/passwd|\/proc\/|\/sys\//i
  ];

  constructor(store: RateLimitStore, config?: Partial<DDoSProtectionConfig>) {
    this.store = store;
    this.config = {
      enabled: true,
      maxRequestsPerMinute: 100,
      maxRequestsPerHour: 1000,
      maxConnectionsPerIP: 10,
      suspiciousThreshold: 50,
      blockDuration: 15 * 60 * 1000, // 15 minutes
      whitelistedIPs: ['127.0.0.1', '::1'],
      blacklistedIPs: [],
      enableGeoBlocking: false,
      blockedCountries: [],
      enableBotDetection: true,
      rateLimitByEndpoint: {
        '/api/auth/login': 5,
        '/api/auth/register': 2,
        '/api/auth/forgot-password': 3,
        '/api/upload': 10
      },
      ...config
    };

    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      suspiciousRequests: 0,
      uniqueIPs: 0,
      topIPs: [],
      topUserAgents: [],
      attackPatterns: []
    };

    // Clean up blocked IPs periodically
    setInterval(() => this.cleanupBlockedIPs(), 60000); // Every minute
  }

  // Check if IP is whitelisted
  private isWhitelisted(ip: string): boolean {
    return this.config.whitelistedIPs.includes(ip) ||
           this.config.whitelistedIPs.some(whiteIP => 
             ip.startsWith(whiteIP.replace('*', ''))
           );
  }

  // Check if IP is blacklisted
  private isBlacklisted(ip: string): boolean {
    return this.config.blacklistedIPs.includes(ip);
  }

  // Check if IP is currently blocked
  private isBlocked(ip: string): boolean {
    const unblockTime = this.blockedIPs.get(ip);
    if (!unblockTime) return false;
    
    if (Date.now() > unblockTime) {
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return true;
  }

  // Block IP for specified duration
  private blockIP(ip: string, duration?: number): void {
    const blockDuration = duration || this.config.blockDuration;
    this.blockedIPs.set(ip, Date.now() + blockDuration);
  }

  // Clean up expired blocked IPs
  private cleanupBlockedIPs(): void {
    const now = Date.now();
    for (const [ip, unblockTime] of this.blockedIPs.entries()) {
      if (now > unblockTime) {
        this.blockedIPs.delete(ip);
      }
    }
  }

  // Detect suspicious patterns in request
  private detectSuspiciousPatterns(req: any): string[] {
    const suspiciousPatterns: string[] = [];
    const url = req.url || '';
    const userAgent = req.headers?.['user-agent'] || '';
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(userAgent) || pattern.test(body)) {
        suspiciousPatterns.push(pattern.toString());
      }
    }

    return suspiciousPatterns;
  }

  // Detect bot behavior
  private detectBot(userAgent: string, requestPattern: any): {
    isBot: boolean;
    botType: string;
    confidence: number;
  } {
    if (!this.config.enableBotDetection) {
      return { isBot: false, botType: 'none', confidence: 0 };
    }

    const userAgentLower = userAgent.toLowerCase();
    
    // Good bots (search engines)
    const goodBots = [
      { pattern: /googlebot/i, type: 'googlebot' },
      { pattern: /bingbot/i, type: 'bingbot' },
      { pattern: /slurp/i, type: 'yahoo' },
      { pattern: /duckduckbot/i, type: 'duckduckgo' }
    ];

    for (const bot of goodBots) {
      if (bot.pattern.test(userAgent)) {
        return { isBot: true, botType: bot.type, confidence: 0.9 };
      }
    }

    // Bad bots (scrapers, attackers)
    const badBots = [
      /scrapy|crawler|spider/i,
      /bot|crawl/i,
      /curl|wget|python|java/i,
      /scanner|exploit/i
    ];

    for (const pattern of badBots) {
      if (pattern.test(userAgent)) {
        return { isBot: true, botType: 'malicious', confidence: 0.8 };
      }
    }

    // Behavioral detection
    let suspicionScore = 0;
    
    // No user agent or very short user agent
    if (!userAgent || userAgent.length < 10) {
      suspicionScore += 0.3;
    }

    // Unusual request patterns
    if (requestPattern?.requestsPerSecond > 10) {
      suspicionScore += 0.4;
    }

    if (requestPattern?.uniqueEndpoints < 2 && requestPattern?.totalRequests > 50) {
      suspicionScore += 0.3;
    }

    return {
      isBot: suspicionScore > 0.6,
      botType: suspicionScore > 0.6 ? 'suspicious' : 'none',
      confidence: suspicionScore
    };
  }

  // Update metrics
  private updateMetrics(context: SecurityContext, blocked: boolean, suspicious: boolean): void {
    this.metrics.totalRequests++;
    
    if (blocked) {
      this.metrics.blockedRequests++;
    }
    
    if (suspicious) {
      this.metrics.suspiciousRequests++;
    }

    // Update IP tracking (simplified for demo)
    // In production, use proper data structures and persistence
  }

  // Main DDoS protection check
  async checkDDoSProtection(req: any, context: SecurityContext): Promise<{
    allowed: boolean;
    violations: SecurityViolation[];
    headers: Record<string, string>;
    blockDuration?: number;
  }> {
    if (!this.config.enabled) {
      return { allowed: true, violations: [], headers: {} };
    }

    const violations: SecurityViolation[] = [];
    const headers: Record<string, string> = {};

    // Check if IP is whitelisted
    if (this.isWhitelisted(context.ip)) {
      return { allowed: true, violations: [], headers };
    }

    // Check if IP is blacklisted
    if (this.isBlacklisted(context.ip)) {
      violations.push({
        type: SecurityViolationType.BLACKLISTED_IP,
        ip: context.ip,
        userAgent: context.userAgent,
        details: { reason: 'IP is blacklisted' },
        timestamp: context.timestamp,
        severity: 'high'
      });

      this.updateMetrics(context, true, true);
      return { 
        allowed: false, 
        violations, 
        headers,
        blockDuration: this.config.blockDuration
      };
    }

    // Check if IP is currently blocked
    if (this.isBlocked(context.ip)) {
      violations.push({
        type: SecurityViolationType.RATE_LIMIT_EXCEEDED,
        ip: context.ip,
        userAgent: context.userAgent,
        details: { 
          reason: 'IP is temporarily blocked due to suspicious activity',
          unblockTime: this.blockedIPs.get(context.ip)
        },
        timestamp: context.timestamp,
        severity: 'high'
      });

      this.updateMetrics(context, true, false);
      return { 
        allowed: false, 
        violations, 
        headers,
        blockDuration: (this.blockedIPs.get(context.ip) || 0) - Date.now()
      };
    }

    // Rate limiting checks
    const minuteKey = `ddos:${context.ip}:minute:${Math.floor(Date.now() / 60000)}`;
    const hourKey = `ddos:${context.ip}:hour:${Math.floor(Date.now() / 3600000)}`;

    try {
      const [minuteCount, hourCount] = await Promise.all([
        this.store.increment(minuteKey, 60000),
        this.store.increment(hourKey, 3600000)
      ]);

      // Check per-minute limit
      if (minuteCount > this.config.maxRequestsPerMinute) {
        violations.push({
          type: SecurityViolationType.RATE_LIMIT_EXCEEDED,
          ip: context.ip,
          userAgent: context.userAgent,
          details: {
            requestsPerMinute: minuteCount,
            limit: this.config.maxRequestsPerMinute
          },
          timestamp: context.timestamp,
          severity: 'medium'
        });

        // Block IP if significantly over limit
        if (minuteCount > this.config.maxRequestsPerMinute * 2) {
          this.blockIP(context.ip);
        }
      }

      // Check per-hour limit
      if (hourCount > this.config.maxRequestsPerHour) {
        violations.push({
          type: SecurityViolationType.RATE_LIMIT_EXCEEDED,
          ip: context.ip,
          userAgent: context.userAgent,
          details: {
            requestsPerHour: hourCount,
            limit: this.config.maxRequestsPerHour
          },
          timestamp: context.timestamp,
          severity: 'high'
        });

        this.blockIP(context.ip);
      }

      // Endpoint-specific rate limiting
      const endpoint = req.path || req.url || '';
      for (const [pattern, limit] of Object.entries(this.config.rateLimitByEndpoint)) {
        if (endpoint.includes(pattern)) {
          const endpointKey = `ddos:${context.ip}:endpoint:${pattern}:${Math.floor(Date.now() / 60000)}`;
          const endpointCount = await this.store.increment(endpointKey, 60000);
          
          if (endpointCount > limit) {
            violations.push({
              type: SecurityViolationType.RATE_LIMIT_EXCEEDED,
              ip: context.ip,
              userAgent: context.userAgent,
              details: {
                endpoint: pattern,
                requests: endpointCount,
                limit
              },
              timestamp: context.timestamp,
              severity: 'high'
            });

            this.blockIP(context.ip, 5 * 60 * 1000); // 5 minute block for endpoint abuse
          }
        }
      }

    } catch (error) {
      console.error('DDoS protection rate limiting error:', error);
    }

    // Detect suspicious patterns
    const suspiciousPatterns = this.detectSuspiciousPatterns(req);
    if (suspiciousPatterns.length > 0) {
      violations.push({
        type: SecurityViolationType.SUSPICIOUS_REQUEST,
        ip: context.ip,
        userAgent: context.userAgent,
        details: {
          patterns: suspiciousPatterns,
          url: req.url,
          method: req.method
        },
        timestamp: context.timestamp,
        severity: 'high'
      });

      // Block IP for suspicious patterns
      this.blockIP(context.ip, 30 * 60 * 1000); // 30 minute block
    }

    // Bot detection
    const botDetection = this.detectBot(context.userAgent || '', {});
    if (botDetection.isBot && botDetection.botType === 'malicious') {
      violations.push({
        type: SecurityViolationType.BOT_DETECTED,
        ip: context.ip,
        userAgent: context.userAgent,
        details: {
          botType: botDetection.botType,
          confidence: botDetection.confidence
        },
        timestamp: context.timestamp,
        severity: 'medium'
      });
    }

    // Update metrics
    this.updateMetrics(context, violations.length > 0, suspiciousPatterns.length > 0);

    // Add rate limit headers
    headers['X-RateLimit-Limit'] = this.config.maxRequestsPerMinute.toString();
    headers['X-RateLimit-Remaining'] = Math.max(0, this.config.maxRequestsPerMinute - (await this.store.get(minuteKey) || 0)).toString();
    headers['X-RateLimit-Reset'] = Math.ceil(Date.now() / 60000 + 1).toString();

    return {
      allowed: violations.length === 0,
      violations,
      headers,
      blockDuration: violations.length > 0 ? this.config.blockDuration : undefined
    };
  }

  // Get current metrics
  getMetrics(): DDoSMetrics {
    return { ...this.metrics };
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      suspiciousRequests: 0,
      uniqueIPs: 0,
      topIPs: [],
      topUserAgents: [],
      attackPatterns: []
    };
  }

  // Manually block/unblock IP
  manuallyBlockIP(ip: string, duration?: number): void {
    this.blockIP(ip, duration);
  }

  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
  }

  // Get blocked IPs
  getBlockedIPs(): Array<{ ip: string; unblockTime: number }> {
    return Array.from(this.blockedIPs.entries()).map(([ip, unblockTime]) => ({
      ip,
      unblockTime
    }));
  }
}

// Export singleton instance (will be initialized with store in main security middleware)
export let ddosProtectionHandler: DDoSProtectionHandler;