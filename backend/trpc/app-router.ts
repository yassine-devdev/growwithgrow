import { router } from './router';
import { dashboardRouter } from '../dashboard/trpc-router';
import { coreRouter } from '../communications/backend/core/trpc-router';
import { schoolHubRouter } from '../school-hub/trpc-router';
import { aiRouter } from '../ai/trpc-router';
import { crmRouter } from '../crm/trpc-router';
import { communicationsRouter } from '../communications/trpc-router';
import { toolsRouter } from '../tools/trpc-router';
import { analyticsRouter } from '../analytics/trpc-router';
import { gamificationRouter } from '../gamification/trpc-router';
import { knowledgeRouter } from '../knowledge/trpc-router';
import { marketplaceRouter } from '../marketplace/trpc-router';
import { notificationsRouter } from '../notifications/trpc-router';
import { settingsRouter } from '../settings/trpc-router';
import { storageRouter } from '../storage/trpc-router';
import { supportRouter } from '../support/trpc-router';
import { webhooksRouter } from '../webhooks/trpc-router';

// Main application router combining all service routers
export const appRouter = router({
  // Core services
  dashboard: dashboardRouter,
  core: coreRouter,
  schoolHub: schoolHubRouter,
  ai: aiRouter,
  crm: crmRouter,
  
  // Communication and collaboration
  communications: communicationsRouter,
  notifications: notificationsRouter,
  
  // Tools and analytics
  tools: toolsRouter,
  analytics: analyticsRouter,
  
  // Learning and content
  knowledge: knowledgeRouter,
  gamification: gamificationRouter,
  
  // Commerce and integrations
  marketplace: marketplaceRouter,
  webhooks: webhooksRouter,
  
  // System services
  settings: settingsRouter,
  storage: storageRouter,
  support: supportRouter,
});

export type AppRouter = typeof appRouter;