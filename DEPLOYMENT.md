# 🚀 Production Deployment Guide

This guide covers deploying the AI-powered SaaS application to production.

## 📋 Pre-deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Set all required API keys:
  - [ ] `VITE_OPENROUTER_API_KEY` (for OpenRouter AI models)
  - [ ] `VITE_GOOGLE_GEMINI_API_KEY` (for Google Gemini)
- [ ] Update URLs for production:
  - [ ] `VITE_APP_URL` (your production domain)
  - [ ] `VITE_TRPC_HTTP_URL` (your backend API URL)
  - [ ] `VITE_TRPC_WS_URL` (your WebSocket URL)
- [ ] Set cost limits:
  - [ ] `VITE_AI_DAILY_COST_LIMIT`
  - [ ] `VITE_AI_MONTHLY_COST_LIMIT`

### 2. Build Configuration
- [ ] Run type checking: `npm run type-check`
- [ ] Test the build: `npm run build:prod`
- [ ] Test the preview: `npm run serve`

### 3. AI Provider Setup

#### OpenRouter (Recommended)
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Get your API key from the dashboard
3. Set `VITE_OPENROUTER_API_KEY` in your environment

#### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Set `VITE_GOOGLE_GEMINI_API_KEY` in your environment

#### Ollama (Optional - for local AI)
1. Install Ollama on your server: [ollama.ai](https://ollama.ai)
2. Pull desired models: `ollama pull llama3.2`
3. Ensure Ollama is accessible at `VITE_OLLAMA_BASE_URL`

## 🏗️ Build Process

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build:prod
```

### Preview Production Build
```bash
npm run serve
```

## 🌐 Deployment Options

### Option 1: Static Hosting (Recommended)

The application builds to static files and can be deployed to any static hosting service:

#### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build:prod`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

#### AWS S3 + CloudFront
1. Build the application: `npm run build:prod`
2. Upload `dist/` contents to S3 bucket
3. Configure CloudFront distribution
4. Set up custom domain and SSL

### Option 2: Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    }
}
```

Build and run:
```bash
docker build -t ai-saas-app .
docker run -p 80:80 ai-saas-app
```

## 🔧 Configuration Validation

The application includes automatic configuration validation. Check the browser console for:
- ✅ Configuration valid
- ⚠️ Warnings (optional features)
- ❌ Errors (must be fixed)

## 📊 Monitoring & Analytics

### AI Usage Monitoring
- The application tracks AI usage automatically
- View usage stats in the Dashboard
- Monitor costs in real-time
- Set up alerts for cost limits

### Error Monitoring
- Built-in error boundary catches React errors
- Console logging for debugging
- Consider integrating with services like:
  - Sentry for error tracking
  - LogRocket for session replay
  - Google Analytics for usage analytics

## 🔒 Security Considerations

### API Keys
- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate API keys regularly
- Monitor API usage for anomalies

### CORS Configuration
- Configure your backend to allow requests from your domain
- Set up proper CORS headers
- Use HTTPS in production

### Content Security Policy
Add CSP headers to your hosting configuration:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://openrouter.ai https://generativelanguage.googleapis.com;
```

## 🚨 Troubleshooting

### Common Issues

#### "AI providers not configured"
- Check that at least one AI provider API key is set
- Verify environment variables are loaded correctly

#### "tRPC connection failed"
- Verify `VITE_TRPC_HTTP_URL` points to your backend
- Check that your backend is running and accessible
- Verify CORS configuration

#### "High AI costs"
- Check usage statistics in the Dashboard
- Verify cost limits are set appropriately
- Monitor which models are being used most

#### "Ollama not working"
- Ensure Ollama is installed and running
- Check that `VITE_OLLAMA_BASE_URL` is correct
- Verify required models are pulled

### Performance Optimization

#### Bundle Size
- The application uses code splitting automatically
- Monitor bundle size with `npm run build:prod`
- Consider lazy loading for heavy components

#### AI Response Times
- Use faster models for real-time features
- Implement request caching where appropriate
- Set appropriate timeout values

#### Caching
- Enable browser caching for static assets
- Use CDN for global distribution
- Cache AI responses when possible

## 📈 Scaling Considerations

### High Traffic
- Use CDN for static assets
- Implement rate limiting for AI requests
- Consider multiple AI provider accounts
- Monitor and scale backend infrastructure

### Cost Management
- Implement user-based cost tracking
- Set up automated cost alerts
- Use cheaper models for non-critical features
- Implement request queuing for batch processing

## 🔄 Updates & Maintenance

### Regular Tasks
- [ ] Monitor AI provider status
- [ ] Review usage and costs monthly
- [ ] Update dependencies regularly
- [ ] Test new AI models and providers
- [ ] Backup configuration and data

### Version Updates
1. Test updates in staging environment
2. Update dependencies: `npm update`
3. Run full test suite
4. Deploy to production
5. Monitor for issues

## 📞 Support

For deployment issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test AI providers individually
4. Check network connectivity
5. Review this deployment guide

The application is designed to be resilient and will gracefully handle provider failures with automatic fallbacks.