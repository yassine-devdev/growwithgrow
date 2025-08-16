# Development Setup

This guide will help you set up the development environment for both the frontend and backend services.

## Prerequisites

- Node.js 18+ 
- pnpm (recommended package manager)
- Git

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Install concurrently for running both services:**
   ```bash
   pnpm add -D concurrently -w
   ```

3. **Start both client and server:**
   ```bash
   pnpm dev
   ```

This single command will start:
- **Frontend (Client)**: http://localhost:3000
- **Backend (Server)**: http://localhost:4000
- **WebSocket Server**: ws://localhost:3001

## Individual Services

If you need to run services individually:

```bash
# Frontend only
pnpm dev:client

# Backend only  
pnpm dev:server
```

## Environment Configuration

The development environment uses `.env.development` for configuration. Key settings:

- **Frontend Port**: 3000
- **Backend Port**: 4000  
- **WebSocket Port**: 3001
- **API Proxy**: Frontend proxies `/trpc` and `/api` requests to backend

## Project Structure

```
├── frontend/                 # React frontend (root directory)
│   ├── components/          # UI components
│   ├── modules/            # Feature modules
│   ├── services/           # API services
│   └── vite.config.ts      # Vite configuration
├── backend/                # Encore.ts backend
│   ├── trpc/              # tRPC routers
│   ├── middleware/        # Security middleware
│   └── main.ts            # Backend entry point
└── pnpm-workspace.yaml    # Workspace configuration
```

## Available Scripts

- `pnpm dev` - Start both frontend and backend
- `pnpm build` - Build both services for production
- `pnpm test` - Run tests (when configured)
- `pnpm type-check` - TypeScript type checking

## Development Features

### Hot Reload
- Frontend: Vite provides instant hot reload
- Backend: Encore.ts provides automatic restart on changes

### API Integration
- Frontend automatically proxies API requests to backend
- tRPC provides type-safe API communication
- WebSocket support for real-time features

### Security Middleware
- CORS configured for development origins
- Rate limiting (relaxed for development)
- Input sanitization and validation
- Security headers via Helmet.js

## Troubleshooting

### Port Conflicts
If ports are already in use, you can change them in:
- Frontend: `vite.config.ts` 
- Backend: `.env.development`

### CORS Issues
Ensure your frontend URL is listed in `CORS_ORIGINS` in `.env.development`

### Backend Connection Issues
Check that the backend is running on port 4000 and the proxy configuration in `vite.config.ts` is correct.

## Production Build

To build for production:

```bash
pnpm build
```

This will:
1. Build the frontend with optimizations
2. Build the backend with Encore.ts
3. Generate production-ready assets

## Next Steps

1. Configure your AI service API keys in `.env.development`
2. Set up your database connection
3. Review the security middleware configuration
4. Start building your production-ready features!

Happy coding! 🚀