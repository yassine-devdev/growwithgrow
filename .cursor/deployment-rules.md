# 🚀 Deployment & Production Rules - Cyberpunk Dashboard

## 🎯 PRODUCTION ARCHITECTURE

### Infrastructure Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN (CloudFlare) │    │   Monitoring   │
│   (Nginx/ALB)   │    │                 │    │   (Sentry)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │    │   (Railway)     │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redis Cache   │    │   File Storage  │    │   Backup        │
│   (Upstash)     │    │   (AWS S3)      │    │   (Automated)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Environment Strategy
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live application with monitoring

## 🐳 DOCKER CONFIGURATION

### Frontend Dockerfile
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Backend Dockerfile
```dockerfile
# Backend Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nodejs

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OLLAMA_HOST=${OLLAMA_HOST}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  redis_data:
```

## 🔧 CI/CD PIPELINE

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm install -g pnpm
          pnpm install
      
      - name: Run tests
        run: |
          pnpm test
          pnpm test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Build application
        run: pnpm build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        run: |
          # Deploy to production environment
          echo "Deploying to production..."
```

### Vercel Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "@api-url"
  },
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## 🔐 ENVIRONMENT VARIABLES

### Frontend Environment
```bash
# .env.production
VITE_API_URL=https://api.cyberpunk-dashboard.com
VITE_APP_NAME=Cyberpunk Dashboard
VITE_APP_VERSION=1.0.0
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ANALYTICS_ID=your-analytics-id
```

### Backend Environment
```bash
# .env.production
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://user:password@host:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI Integration
OPENROUTER_API_KEY=your-openrouter-api-key
OLLAMA_HOST=http://localhost:11434

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=cyberpunk-dashboard-files

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info

# Security
CORS_ORIGIN=https://cyberpunk-dashboard.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 MONITORING & LOGGING

### Sentry Configuration
```typescript
// services/monitoring.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export const initializeMonitoring = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new ProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
};

export const captureError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};
```

### Logging Strategy
```typescript
// services/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cyberpunk-dashboard' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### Health Checks
```typescript
// services/health.ts
import { prisma } from '../utils/database';
import { redis } from '../services/cache';

export const healthCheck = async () => {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Check Redis
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  return checks;
};
```

## 🔒 SECURITY CONFIGURATION

### Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:3001;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        listen 80;
        server_name cyberpunk-dashboard.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name cyberpunk-dashboard.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Login endpoint with stricter rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Security Headers
```typescript
// middleware/security.ts
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.cyberpunk-dashboard.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['https://cyberpunk-dashboard.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
];
```

## 📈 PERFORMANCE OPTIMIZATION

### Database Optimization
```sql
-- Database indexes for performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_date ON activities(date);

-- Partitioning for large tables
CREATE TABLE activities_partitioned (
    LIKE activities INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE activities_2024 PARTITION OF activities_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Caching Strategy
```typescript
// services/cache-strategy.ts
import { cacheService } from './cache';

export class CacheStrategy {
  // Cache user data for 1 hour
  static async getUserData(userId: string) {
    const cacheKey = `user:${userId}`;
    let userData = await cacheService.get(cacheKey);
    
    if (!userData) {
      userData = await prisma.user.findUnique({
        where: { id: userId },
        include: { settings: true },
      });
      await cacheService.set(cacheKey, userData, 3600);
    }
    
    return userData;
  }

  // Cache dashboard stats for 5 minutes
  static async getDashboardStats(userId: string) {
    const cacheKey = `dashboard:stats:${userId}`;
    let stats = await cacheService.get(cacheKey);
    
    if (!stats) {
      stats = await this.calculateDashboardStats(userId);
      await cacheService.set(cacheKey, stats, 300);
    }
    
    return stats;
  }

  // Invalidate cache on data changes
  static async invalidateUserCache(userId: string) {
    await cacheService.delete(`user:${userId}`);
    await cacheService.invalidatePattern(`dashboard:stats:${userId}`);
  }
}
```

## 🔄 BACKUP & RECOVERY

### Database Backup
```bash
#!/bin/bash
# backup.sh

# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backup_*.sql s3://cyberpunk-dashboard-backups/

# Clean up old backups (keep last 7 days)
find . -name "backup_*.sql" -mtime +7 -delete
```

### Automated Backup Schedule
```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Create database backup
        run: |
          pg_dump ${{ secrets.DATABASE_URL }} > backup.sql
          gzip backup.sql
      
      - name: Upload to S3
        run: |
          aws s3 cp backup.sql.gz s3://cyberpunk-dashboard-backups/
      
      - name: Clean up old backups
        run: |
          aws s3 ls s3://cyberpunk-dashboard-backups/ | \
          awk '{print $4}' | \
          sort | \
          head -n -7 | \
          xargs -I {} aws s3 rm s3://cyberpunk-dashboard-backups/{}
```

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates valid

### Deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Validate functionality
- [ ] Update DNS if needed

### Post-Deployment
- [ ] Monitor application logs
- [ ] Check database performance
- [ ] Verify backup systems
- [ ] Test rollback procedures
- [ ] Update monitoring alerts
- [ ] Document deployment
- [ ] Notify stakeholders

## 🚨 INCIDENT RESPONSE

### Monitoring Alerts
```typescript
// services/alerts.ts
export const alertConfig = {
  errorRate: {
    threshold: 5, // 5% error rate
    window: '5m',
    channels: ['slack', 'email'],
  },
  responseTime: {
    threshold: 2000, // 2 seconds
    window: '1m',
    channels: ['slack'],
  },
  databaseConnections: {
    threshold: 80, // 80% of max connections
    window: '5m',
    channels: ['pagerduty'],
  },
  diskSpace: {
    threshold: 90, // 90% disk usage
    window: '10m',
    channels: ['slack', 'email'],
  },
};
```

### Rollback Procedures
```bash
#!/bin/bash
# rollback.sh

# Rollback to previous version
git checkout HEAD~1
npm run build
docker-compose up -d

# Verify rollback
curl -f http://localhost/health || exit 1

echo "Rollback completed successfully"
```

Remember: Production deployment requires careful planning, testing, and monitoring to ensure reliability and performance.
