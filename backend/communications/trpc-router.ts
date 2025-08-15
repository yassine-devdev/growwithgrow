import { z } from 'zod';
import { router, protectedProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';

// Placeholder communications router - will be fully implemented in subsequent tasks
export const communicationsRouter = router({
  emails: router({
    list: protectedProcedure
      .input(PaginationSchema)
      .query(async ({ input }) => {
        return { emails: [], total: 0, hasMore: false };
      }),
  }),
  templates: router({
    list: protectedProcedure
      .input(PaginationSchema)
      .query(async ({ input }) => {
        return { templates: [], total: 0, hasMore: false };
      }),
  }),
  announcements: router({
    list: protectedProcedure
      .input(PaginationSchema)
      .query(async ({ input }) => {
        return { announcements: [], total: 0, hasMore: false };
      }),
  }),
});