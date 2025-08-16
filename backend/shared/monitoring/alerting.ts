import { createLogger } from './logger.js';
import { healthCheckManager, SystemHealthStatus } from './health-checks.js';

const logger = createLogger(undefined, undefined, 'alerting');

export interface Alert {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  component: string;
  metadata?: any;
  resolved?: boolean;
  resolvedAt?: string;
}

export interface AlertRule {
  name: string;
  condition: (data: any) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  component: string;
  cooldown: number; // milliseconds
  enabled: boolean;
}

export interface NotificationChannel {
  name: string;
  type: 'webhook' | 'email' | 'slack' | 'console';
  config: any;
  enabled: boolean;
}

// Alert manager class
export class AlertManager {
  private alerts: Map<string, Alert> = new Map();
  private rules: AlertRule[] = [];
  private channels: NotificationChannel[] = [];
  private lastAlertTime: Map<string, number> = new Map();

  constructor() {
    this.setupDefaultRules();
    this.setupDefaultChannels();
    this.startHealthCheckMonitoring();
  }

  private setupDefaultRules() {
    // High error rate alert
    this.addRule({
      name: 'high_error_rate',
      condition: (data) => data.errorRate > 0.1,
      severity: 'high',
      message: 'High error rate detected: {{errorRate}} errors/sec',
      component: 'application',
      cooldown: 300000, // 5 minutes
      enabled: true
    });

    // High response time alert
    this.addRule({
      name: 'high_response_time',
      condition: (data) => data.responseTime > 2000,
      severity: 'medium',
      message: 'High response time detected: {{responseTime}}ms',
      component: 'application',
      cooldown: 300000,
      enabled: true
    });

    // Database connection alert
    this.addRule({
      name: 'database_unhealthy',
      condition: (data) => data.databaseHealth === false,
      severity: 'critical',
      message: 'Database health check failed',
      component: 'database',
      cooldown: 60000, // 1 minute
      enabled: true
    });

    // Memory usage alert
    this.addRule({
      name: 'high_memory_usage',
      condition: (data) => data.memoryUsage > 0.9,
      severity: 'high',
      message: 'High memory usage: {{memoryUsage}}%',
      component: 'system',
      cooldown: 300000,
      enabled: true
    });

    // AI service cost alert
    this.addRule({
      name: 'high_ai_costs',
      condition: (data) => data.aiCostPerHour > 50,
      severity: 'medium',
      message: 'High AI service costs: ${{aiCostPerHour}}/hour',
      component: 'ai',
      cooldown: 3600000, // 1 hour
      enabled: true
    });

    // External API failures
    this.addRule({
      name: 'external_api_failures',
      condition: (data) => data.externalApiFailureRate > 0.2,
      severity: 'medium',
      message: 'External API failure rate high: {{externalApiFailureRate}}%',
      component: 'external_api',
      cooldown: 600000, // 10 minutes
      enabled: true
    });
  }

  private setupDefaultChannels() {
    // Console notification (always available)
    this.addChannel({
      name: 'console',
      type: 'console',
      config: {},
      enabled: true
    });

    // Webhook notification (for integration with external systems)
    if (process.env.ALERT_WEBHOOK_URL) {
      this.addChannel({
        name: 'webhook',
        type: 'webhook',
        config: {
          url: process.env.ALERT_WEBHOOK_URL,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.ALERT_WEBHOOK_TOKEN ? `Bearer ${process.env.ALERT_WEBHOOK_TOKEN}` : undefined
          }
        },
        enabled: true
      });
    }

    // Email notification (using SMTP)
    if (process.env.SMTP_HOST) {
      this.addChannel({
        name: 'email',
        type: 'email',
        config: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          from: process.env.ALERT_FROM_EMAIL || 'alerts@yourapp.com',
          to: process.env.ALERT_TO_EMAIL?.split(',') || []
        },
        enabled: true
      });
    }

    // Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      this.addChannel({
        name: 'slack',
        type: 'slack',
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: process.env.SLACK_ALERT_CHANNEL || '#alerts',
          username: 'AlertBot'
        },
        enabled: true
      });
    }
  }

  addRule(rule: AlertRule) {
    this.rules.push(rule);
    logger.info('Alert rule added', { ruleName: rule.name, severity: rule.severity });
  }

  removeRule(name: string) {
    this.rules = this.rules.filter(rule => rule.name !== name);
    logger.info('Alert rule removed', { ruleName: name });
  }

  addChannel(channel: NotificationChannel) {
    this.channels.push(channel);
    logger.info('Notification channel added', { channelName: channel.name, type: channel.type });
  }

  removeChannel(name: string) {
    this.channels = this.channels.filter(channel => channel.name !== name);
    logger.info('Notification channel removed', { channelName: name });
  }

  async checkRules(data: any) {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        const shouldAlert = rule.condition(data);
        
        if (shouldAlert) {
          const lastAlert = this.lastAlertTime.get(rule.name) || 0;
          const now = Date.now();
          
          // Check cooldown period
          if (now - lastAlert < rule.cooldown) {
            continue;
          }

          await this.triggerAlert(rule, data);
          this.lastAlertTime.set(rule.name, now);
        }
      } catch (error) {
        logger.error('Error checking alert rule', error, { ruleName: rule.name });
      }
    }
  }

  private async triggerAlert(rule: AlertRule, data: any) {
    const alert: Alert = {
      id: `${rule.name}_${Date.now()}`,
      name: rule.name,
      severity: rule.severity,
      message: this.interpolateMessage(rule.message, data),
      timestamp: new Date().toISOString(),
      component: rule.component,
      metadata: data,
      resolved: false
    };

    this.alerts.set(alert.id, alert);

    logger.warn('Alert triggered', {
      alertId: alert.id,
      alertName: alert.name,
      severity: alert.severity,
      component: alert.component
    });

    // Send notifications
    await this.sendNotifications(alert);
  }

  private interpolateMessage(template: string, data: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key]?.toString() || match;
    });
  }

  private async sendNotifications(alert: Alert) {
    const enabledChannels = this.channels.filter(channel => channel.enabled);
    
    const notificationPromises = enabledChannels.map(channel => 
      this.sendNotification(channel, alert).catch(error => {
        logger.error('Failed to send notification', error, {
          channelName: channel.name,
          channelType: channel.type,
          alertId: alert.id
        });
      })
    );

    await Promise.allSettled(notificationPromises);
  }

  private async sendNotification(channel: NotificationChannel, alert: Alert) {
    switch (channel.type) {
      case 'console':
        this.sendConsoleNotification(alert);
        break;
      case 'webhook':
        await this.sendWebhookNotification(channel.config, alert);
        break;
      case 'email':
        await this.sendEmailNotification(channel.config, alert);
        break;
      case 'slack':
        await this.sendSlackNotification(channel.config, alert);
        break;
      default:
        logger.warn('Unknown notification channel type', { type: channel.type });
    }
  }

  private sendConsoleNotification(alert: Alert) {
    const emoji = this.getSeverityEmoji(alert.severity);
    console.log(`${emoji} ALERT [${alert.severity.toUpperCase()}] ${alert.name}: ${alert.message}`);
  }

  private async sendWebhookNotification(config: any, alert: Alert) {
    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify({
          alert: {
            id: alert.id,
            name: alert.name,
            severity: alert.severity,
            message: alert.message,
            timestamp: alert.timestamp,
            component: alert.component,
            metadata: alert.metadata
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
      }

      logger.debug('Webhook notification sent', { alertId: alert.id, webhookUrl: config.url });
    } catch (error) {
      logger.error('Failed to send webhook notification', error);
      throw error;
    }
  }

  private async sendEmailNotification(config: any, alert: Alert) {
    // This would use nodemailer or similar library
    // For now, just log the email that would be sent
    logger.info('Email notification would be sent', {
      to: config.to,
      subject: `[${alert.severity.toUpperCase()}] ${alert.name}`,
      body: `Alert: ${alert.message}\n\nTimestamp: ${alert.timestamp}\nComponent: ${alert.component}\n\nMetadata: ${JSON.stringify(alert.metadata, null, 2)}`
    });
  }

  private async sendSlackNotification(config: any, alert: Alert) {
    try {
      const color = this.getSeverityColor(alert.severity);
      const emoji = this.getSeverityEmoji(alert.severity);
      
      const payload = {
        channel: config.channel,
        username: config.username,
        attachments: [
          {
            color,
            title: `${emoji} ${alert.name}`,
            text: alert.message,
            fields: [
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true
              },
              {
                title: 'Component',
                value: alert.component,
                short: true
              },
              {
                title: 'Timestamp',
                value: alert.timestamp,
                short: false
              }
            ],
            footer: 'Production App Monitoring',
            ts: Math.floor(Date.parse(alert.timestamp) / 1000)
          }
        ]
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
      }

      logger.debug('Slack notification sent', { alertId: alert.id });
    } catch (error) {
      logger.error('Failed to send Slack notification', error);
      throw error;
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'good';
      case 'low': return '#36a64f';
      default: return '#36a64f';
    }
  }

  // Start monitoring health checks
  private startHealthCheckMonitoring() {
    setInterval(async () => {
      try {
        const healthStatus = await healthCheckManager.runHealthChecks();
        await this.checkHealthAlerts(healthStatus);
      } catch (error) {
        logger.error('Error during health check monitoring', error);
      }
    }, 60000); // Check every minute
  }

  private async checkHealthAlerts(healthStatus: SystemHealthStatus) {
    const data = {
      overallHealth: healthStatus.status === 'healthy',
      databaseHealth: healthStatus.checks.database?.healthy || false,
      redisHealth: healthStatus.checks.redis?.healthy || false,
      memoryUsage: this.calculateMemoryUsage(healthStatus.checks.memory?.metadata),
      diskUsage: this.calculateDiskUsage(healthStatus.checks.disk_space?.metadata),
      externalApiHealth: this.calculateExternalApiHealth(healthStatus.checks)
    };

    await this.checkRules(data);
  }

  private calculateMemoryUsage(memoryMetadata: any): number {
    if (!memoryMetadata) return 0;
    return memoryMetadata.heap_used / memoryMetadata.heap_total;
  }

  private calculateDiskUsage(diskMetadata: any): number {
    if (!diskMetadata) return 0;
    return diskMetadata.usage_percent / 100;
  }

  private calculateExternalApiHealth(checks: any): boolean {
    const externalApiChecks = Object.entries(checks)
      .filter(([name]) => name.startsWith('external_api_'))
      .map(([, check]: [string, any]) => check.healthy);
    
    if (externalApiChecks.length === 0) return true;
    return externalApiChecks.some(healthy => healthy);
  }

  // Get active alerts
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  // Get all alerts
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  // Resolve alert
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      logger.info('Alert resolved', { alertId, alertName: alert.name });
      return true;
    }
    return false;
  }

  // Get alert statistics
  getAlertStats() {
    const alerts = Array.from(this.alerts.values());
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    
    const recent = alerts.filter(alert => Date.parse(alert.timestamp) > last24h);
    
    return {
      total: alerts.length,
      active: alerts.filter(alert => !alert.resolved).length,
      resolved: alerts.filter(alert => alert.resolved).length,
      last24h: recent.length,
      bySeverity: {
        critical: alerts.filter(alert => alert.severity === 'critical').length,
        high: alerts.filter(alert => alert.severity === 'high').length,
        medium: alerts.filter(alert => alert.severity === 'medium').length,
        low: alerts.filter(alert => alert.severity === 'low').length
      }
    };
  }
}

// Singleton instance
export const alertManager = new AlertManager();