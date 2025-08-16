# SSL/TLS & Security Configuration Guide

This guide covers the implementation of comprehensive SSL/TLS and security configurations for production deployment.

## Overview

The security implementation includes:

- **Automatic SSL Certificate Provisioning** with Let's Encrypt
- **Enhanced Security Headers** and HTTPS enforcement
- **Production CORS Policies** with strict origin validation
- **DDoS Protection** and advanced rate limiting
- **Security Monitoring** and alerting system
- **Fail2ban Integration** for additional protection

## Components

### 1. SSL/TLS Configuration

#### Files:
- `docker/ssl-config.conf` - SSL/TLS configuration for Nginx
- `docker/nginx-ssl.conf` - Enhanced Nginx configuration with SSL
- `docker/default-ssl.conf` - SSL-enabled virtual host configuration
- `scripts/ssl-setup.sh` - Automated SSL certificate setup script

#### Features:
- **TLS 1.2 and 1.3 support** with secure cipher suites
- **HSTS (HTTP Strict Transport Security)** with preload
- **OCSP Stapling** for certificate validation
- **Perfect Forward Secrecy** with DH parameters
- **Automatic certificate renewal** via cron jobs

### 2. Enhanced Security Middleware

#### Files:
- `backend/middleware/security/ssl-security.ts` - SSL/TLS security handler
- `backend/middleware/security/ddos-protection.ts` - DDoS protection system
- Updated `backend/middleware/security/index.ts` - Integrated security middleware

#### Features:
- **HTTPS Enforcement** in production
- **SSL Connection Validation** with TLS version checking
- **Enhanced Security Headers** (CSP, HSTS, etc.)
- **Certificate Health Monitoring** with expiry alerts

### 3. DDoS Protection System

#### Features:
- **Multi-layer Rate Limiting**:
  - Per-minute and per-hour limits
  - Endpoint-specific rate limits
  - Connection limits per IP
- **Suspicious Pattern Detection**:
  - SQL injection attempts
  - XSS attempts
  - Path traversal attempts
  - Bot detection
- **IP Blocking System**:
  - Temporary blocks for violations
  - Whitelist/blacklist support
  - Automatic cleanup of expired blocks
- **Real-time Metrics** and monitoring

### 4. Security Monitoring

#### Files:
- `security-monitor/` - Dedicated security monitoring service
- `Dockerfile.security-monitor` - Container for monitoring service

#### Features:
- **Real-time Security Alerts** via email and Slack
- **Certificate Expiry Monitoring** with advance warnings
- **Attack Pattern Detection** and reporting
- **Security Dashboard** with metrics and violations
- **Automated Incident Response** capabilities

### 5. Fail2ban Integration

#### Files:
- `fail2ban/jail.local` - Fail2ban jail configuration
- `fail2ban/filter.d/` - Custom filters for application-specific attacks

#### Features:
- **Nginx-specific Protection** against common attacks
- **API Abuse Detection** with custom filters
- **Login Attempt Monitoring** with progressive penalties
- **Automatic IP Banning** for repeated violations

## Deployment

### Prerequisites

1. **Domain Name** pointing to your server
2. **Email Address** for Let's Encrypt notifications
3. **Root Access** for SSL certificate setup
4. **Docker and Docker Compose** installed

### Environment Variables

Create a `.env.production` file with:

```bash
# Domain Configuration
DOMAIN=yourdomain.com
EMAIL=admin@yourdomain.com

# Database Security
DB_PASSWORD=your-secure-db-password
REDIS_PASSWORD=your-secure-redis-password
JWT_SECRET=your-secure-jwt-secret

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Security Settings
ENFORCE_HTTPS=true
HSTS_MAX_AGE=31536000
ENABLE_DDOS_PROTECTION=true
MAX_REQUESTS_PER_MINUTE=100
MAX_REQUESTS_PER_HOUR=1000

# Rate Limiting
LOGIN_RATE_LIMIT=5
REGISTER_RATE_LIMIT=2
UPLOAD_RATE_LIMIT=10

# Monitoring
ALERT_EMAIL=security@yourdomain.com
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Quick Deployment

1. **Run the deployment script**:
   ```bash
   sudo bash scripts/deploy-production.sh
   ```

2. **Or deploy step by step**:
   ```bash
   # SSL setup only
   sudo bash scripts/deploy-production.sh ssl-only
   
   # Application deployment only
   bash scripts/deploy-production.sh deploy-only
   
   # Verification only
   bash scripts/deploy-production.sh verify
   ```

### Manual Deployment Steps

1. **Setup SSL Certificates**:
   ```bash
   sudo DOMAIN=yourdomain.com EMAIL=admin@yourdomain.com bash scripts/ssl-setup.sh
   ```

2. **Deploy with Docker Compose**:
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

3. **Verify Deployment**:
   ```bash
   curl -I https://yourdomain.com
   ```

## Security Features

### 1. SSL/TLS Security

- **TLS 1.2/1.3 Only**: Disabled older, insecure protocols
- **Strong Cipher Suites**: Modern, secure encryption algorithms
- **Perfect Forward Secrecy**: Each session uses unique keys
- **HSTS**: Prevents downgrade attacks
- **Certificate Pinning**: Optional for enhanced security

### 2. HTTP Security Headers

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [comprehensive policy]
Permissions-Policy: [restrictive permissions]
```

### 3. DDoS Protection

- **Rate Limiting**: Multiple layers with different time windows
- **Pattern Detection**: Identifies common attack patterns
- **Behavioral Analysis**: Detects suspicious bot behavior
- **Automatic Blocking**: Temporary IP blocks for violations
- **Geo-blocking**: Optional country-based restrictions

### 4. CORS Security

- **Strict Origin Validation**: Only allowed domains accepted
- **Credential Handling**: Secure cookie and auth header handling
- **Method Restrictions**: Limited to necessary HTTP methods
- **Header Validation**: Only approved headers allowed

## Monitoring and Alerting

### Security Dashboard

Access the security dashboard at: `https://yourdomain.com/security-dashboard`

Features:
- Real-time security metrics
- Recent violations and attacks
- Blocked IP addresses
- SSL certificate status
- System health indicators

### Alert Types

1. **High Severity Violations**: Immediate email/Slack alerts
2. **DDoS Attacks**: Real-time attack notifications
3. **Certificate Expiry**: 30-day advance warnings
4. **System Health**: Service availability alerts
5. **Failed Login Attempts**: Brute force detection

### Log Files

- **Security Logs**: `/var/log/nginx/security.log`
- **Access Logs**: `/var/log/nginx/access.log`
- **Error Logs**: `/var/log/nginx/error.log`
- **Application Logs**: `logs/app/`
- **Security Monitor Logs**: `logs/security/`

## Maintenance

### Certificate Renewal

Certificates are automatically renewed via cron jobs:
```bash
# Check renewal status
sudo /usr/local/bin/renew-ssl.sh

# Manual renewal
sudo certbot renew --webroot --webroot-path=/var/www/certbot
```

### Security Updates

1. **Update Security Rules**:
   ```bash
   # Update fail2ban rules
   sudo fail2ban-client reload
   
   # Update nginx configuration
   sudo nginx -s reload
   ```

2. **Update Docker Images**:
   ```bash
   docker-compose -f docker-compose.production.yml pull
   docker-compose -f docker-compose.production.yml up -d
   ```

### Backup and Recovery

- **Database Backups**: Automated daily backups
- **SSL Certificates**: Backed up with each renewal
- **Configuration Files**: Version controlled
- **Log Rotation**: Automated cleanup of old logs

## Troubleshooting

### Common Issues

1. **Certificate Not Loading**:
   - Check file permissions: `ls -la /etc/letsencrypt/live/`
   - Verify nginx configuration: `nginx -t`
   - Check domain DNS: `nslookup yourdomain.com`

2. **Rate Limiting Too Aggressive**:
   - Adjust limits in `docker-compose.production.yml`
   - Whitelist trusted IPs in DDoS protection
   - Check fail2ban jail status: `fail2ban-client status`

3. **Security Headers Missing**:
   - Verify nginx SSL configuration
   - Check security middleware integration
   - Test with: `curl -I https://yourdomain.com`

### Testing Security

1. **SSL Test**:
   ```bash
   # Test SSL configuration
   openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
   
   # Online SSL test
   # Visit: https://www.ssllabs.com/ssltest/
   ```

2. **Security Headers Test**:
   ```bash
   # Test security headers
   curl -I https://yourdomain.com
   
   # Online security test
   # Visit: https://securityheaders.com/
   ```

3. **Rate Limiting Test**:
   ```bash
   # Test rate limiting
   for i in {1..20}; do curl https://yourdomain.com/api/test; done
   ```

## Security Best Practices

1. **Regular Updates**: Keep all components updated
2. **Monitor Logs**: Review security logs regularly
3. **Test Backups**: Verify backup integrity periodically
4. **Security Audits**: Conduct regular security assessments
5. **Incident Response**: Have a plan for security incidents
6. **Access Control**: Limit administrative access
7. **Network Security**: Use firewalls and VPNs
8. **Data Encryption**: Encrypt sensitive data at rest

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Test individual components
4. Consult security documentation
5. Contact system administrators

## Security Compliance

This configuration helps meet various security standards:
- **OWASP Top 10** protection
- **PCI DSS** compliance features
- **GDPR** data protection measures
- **SOC 2** security controls
- **ISO 27001** security framework alignment