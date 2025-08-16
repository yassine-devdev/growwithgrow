const express = require('express');
const redis = require('redis');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { CronJob } = require('cron');

const app = express();
const port = process.env.PORT || 3001;

// Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Security monitoring class
class SecurityMonitor {
  constructor() {
    this.alertThresholds = {
      blockedRequestsPerMinute: 50,
      suspiciousRequestsPerMinute: 20,
      uniqueAttackersPerHour: 10,
      certificateExpiryDays: 30
    };
    
    this.lastAlerts = new Map();
    this.alertCooldown = 15 * 60 * 1000; // 15 minutes
  }

  // Check if we should send an alert (rate limiting)
  shouldSendAlert(alertType) {
    const lastAlert = this.lastAlerts.get(alertType);
    if (!lastAlert) return true;
    
    return Date.now() - lastAlert > this.alertCooldown;
  }

  // Send email alert
  async sendEmailAlert(subject, message) {
    if (!process.env.ALERT_EMAIL) return;

    try {
      await emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ALERT_EMAIL,
        subject: `[SECURITY ALERT] ${subject}`,
        html: `
          <h2>Security Alert</h2>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Alert:</strong> ${subject}</p>
          <div>
            <h3>Details:</h3>
            <pre>${message}</pre>
          </div>
          <p>Please investigate immediately.</p>
        `
      });
      
      console.log(`Email alert sent: ${subject}`);
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  // Send Slack alert
  async sendSlackAlert(subject, message) {
    if (!process.env.SLACK_WEBHOOK) return;

    try {
      await axios.post(process.env.SLACK_WEBHOOK, {
        text: `🚨 *Security Alert*: ${subject}`,
        attachments: [{
          color: 'danger',
          fields: [{
            title: 'Details',
            value: message,
            short: false
          }, {
            title: 'Time',
            value: new Date().toISOString(),
            short: true
          }]
        }]
      });
      
      console.log(`Slack alert sent: ${subject}`);
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  // Send alert through all channels
  async sendAlert(alertType, subject, message) {
    if (!this.shouldSendAlert(alertType)) {
      return;
    }

    this.lastAlerts.set(alertType, Date.now());
    
    await Promise.all([
      this.sendEmailAlert(subject, message),
      this.sendSlackAlert(subject, message)
    ]);
  }

  // Monitor DDoS attacks
  async monitorDDoSAttacks() {
    try {
      const metrics = await redisClient.hGetAll('ddos:metrics');
      
      if (!metrics) return;

      const blockedRequests = parseInt(metrics.blockedRequestsLastMinute || 0);
      const suspiciousRequests = parseInt(metrics.suspiciousRequestsLastMinute || 0);
      const uniqueAttackers = parseInt(metrics.uniqueAttackersLastHour || 0);

      // Check blocked requests threshold
      if (blockedRequests > this.alertThresholds.blockedRequestsPerMinute) {
        await this.sendAlert(
          'ddos_blocked_requests',
          'High Number of Blocked Requests',
          `${blockedRequests} requests blocked in the last minute (threshold: ${this.alertThresholds.blockedRequestsPerMinute})`
        );
      }

      // Check suspicious requests threshold
      if (suspiciousRequests > this.alertThresholds.suspiciousRequestsPerMinute) {
        await this.sendAlert(
          'ddos_suspicious_requests',
          'High Number of Suspicious Requests',
          `${suspiciousRequests} suspicious requests detected in the last minute (threshold: ${this.alertThresholds.suspiciousRequestsPerMinute})`
        );
      }

      // Check unique attackers threshold
      if (uniqueAttackers > this.alertThresholds.uniqueAttackersPerHour) {
        await this.sendAlert(
          'ddos_unique_attackers',
          'High Number of Unique Attackers',
          `${uniqueAttackers} unique attackers detected in the last hour (threshold: ${this.alertThresholds.uniqueAttackersPerHour})`
        );
      }

    } catch (error) {
      console.error('Error monitoring DDoS attacks:', error);
    }
  }

  // Monitor SSL certificate expiry
  async monitorSSLCertificate() {
    try {
      const domain = process.env.DOMAIN || 'localhost';
      const https = require('https');
      
      return new Promise((resolve) => {
        const options = {
          hostname: domain,
          port: 443,
          method: 'GET',
          timeout: 5000
        };

        const req = https.request(options, (res) => {
          const cert = res.connection.getPeerCertificate();
          
          if (cert && cert.valid_to) {
            const expiryDate = new Date(cert.valid_to);
            const now = new Date();
            const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry <= this.alertThresholds.certificateExpiryDays) {
              this.sendAlert(
                'ssl_certificate_expiry',
                'SSL Certificate Expiring Soon',
                `SSL certificate for ${domain} expires in ${daysUntilExpiry} days (${expiryDate.toISOString()})`
              );
            }
          }
          
          resolve();
        });

        req.on('error', (error) => {
          console.error('SSL certificate check failed:', error);
          resolve();
        });

        req.on('timeout', () => {
          req.destroy();
          resolve();
        });

        req.end();
      });
    } catch (error) {
      console.error('Error monitoring SSL certificate:', error);
    }
  }

  // Monitor security violations
  async monitorSecurityViolations() {
    try {
      const violations = await redisClient.lRange('security:violations', 0, -1);
      
      if (violations.length === 0) return;

      // Group violations by type and severity
      const violationStats = {};
      const highSeverityViolations = [];

      violations.forEach(violationStr => {
        try {
          const violation = JSON.parse(violationStr);
          const key = `${violation.type}_${violation.severity}`;
          
          violationStats[key] = (violationStats[key] || 0) + 1;
          
          if (violation.severity === 'high') {
            highSeverityViolations.push(violation);
          }
        } catch (e) {
          console.error('Failed to parse violation:', e);
        }
      });

      // Alert on high severity violations
      if (highSeverityViolations.length > 0) {
        const message = highSeverityViolations
          .slice(0, 5) // Show only first 5
          .map(v => `${v.type}: ${v.ip} - ${JSON.stringify(v.details)}`)
          .join('\n');

        await this.sendAlert(
          'high_severity_violations',
          `${highSeverityViolations.length} High Severity Security Violations`,
          message
        );
      }

      // Clear processed violations
      await redisClient.del('security:violations');

    } catch (error) {
      console.error('Error monitoring security violations:', error);
    }
  }

  // Get security dashboard data
  async getSecurityDashboard() {
    try {
      const [
        ddosMetrics,
        blockedIPs,
        violations,
        systemHealth
      ] = await Promise.all([
        redisClient.hGetAll('ddos:metrics'),
        redisClient.sMembers('security:blocked_ips'),
        redisClient.lRange('security:violations', 0, 99),
        this.getSystemHealth()
      ]);

      return {
        ddos: ddosMetrics || {},
        blockedIPs: blockedIPs || [],
        recentViolations: violations.map(v => {
          try {
            return JSON.parse(v);
          } catch {
            return null;
          }
        }).filter(Boolean).slice(0, 20),
        systemHealth,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting security dashboard:', error);
      return { error: error.message };
    }
  }

  // Get system health metrics
  async getSystemHealth() {
    const health = {
      ssl: { status: 'unknown', details: {} },
      redis: { status: 'unknown', details: {} },
      nginx: { status: 'unknown', details: {} }
    };

    try {
      // Check SSL certificate
      const domain = process.env.DOMAIN || 'localhost';
      const sslCheck = await this.checkSSLHealth(domain);
      health.ssl = sslCheck;

      // Check Redis
      const redisInfo = await redisClient.info();
      health.redis = {
        status: 'healthy',
        details: { connected: true, info: redisInfo.split('\n').slice(0, 5) }
      };

      // Check Nginx (simplified)
      health.nginx = { status: 'healthy', details: { running: true } };

    } catch (error) {
      console.error('Error checking system health:', error);
    }

    return health;
  }

  // Check SSL health
  async checkSSLHealth(domain) {
    return new Promise((resolve) => {
      const https = require('https');
      const options = {
        hostname: domain,
        port: 443,
        method: 'GET',
        timeout: 5000
      };

      const req = https.request(options, (res) => {
        const cert = res.connection.getPeerCertificate();
        
        if (cert && cert.valid_to) {
          const expiryDate = new Date(cert.valid_to);
          const daysUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          resolve({
            status: daysUntilExpiry > 7 ? 'healthy' : 'warning',
            details: {
              expiryDate: cert.valid_to,
              daysUntilExpiry,
              issuer: cert.issuer?.CN || 'Unknown'
            }
          });
        } else {
          resolve({
            status: 'error',
            details: { error: 'No certificate found' }
          });
        }
      });

      req.on('error', (error) => {
        resolve({
          status: 'error',
          details: { error: error.message }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 'error',
          details: { error: 'Connection timeout' }
        });
      });

      req.end();
    });
  }

  // Start monitoring
  start() {
    console.log('Starting security monitoring...');

    // Monitor DDoS attacks every minute
    new CronJob('0 * * * * *', () => {
      this.monitorDDoSAttacks();
    }, null, true);

    // Monitor SSL certificate daily
    new CronJob('0 0 * * *', () => {
      this.monitorSSLCertificate();
    }, null, true);

    // Monitor security violations every 5 minutes
    new CronJob('0 */5 * * * *', () => {
      this.monitorSecurityViolations();
    }, null, true);

    console.log('Security monitoring started');
  }
}

// Initialize security monitor
const securityMonitor = new SecurityMonitor();

// Express routes
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/dashboard', async (req, res) => {
  const dashboard = await securityMonitor.getSecurityDashboard();
  res.json(dashboard);
});

app.post('/alert/test', async (req, res) => {
  await securityMonitor.sendAlert('test', 'Test Alert', 'This is a test alert from the security monitoring system');
  res.json({ message: 'Test alert sent' });
});

// Start server
app.listen(port, () => {
  console.log(`Security monitor listening on port ${port}`);
  
  // Connect to Redis
  redisClient.connect().then(() => {
    console.log('Connected to Redis');
    securityMonitor.start();
  }).catch(console.error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down security monitor...');
  redisClient.quit();
  process.exit(0);
});