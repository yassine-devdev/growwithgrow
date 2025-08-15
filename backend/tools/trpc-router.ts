import { router, protectedProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';

export const toolsRouter = router({
  reports: router({
    list: protectedProcedure.input(PaginationSchema).query(async () => ({ reports: [], total: 0, hasMore: false })),
  }),
  marketing: router({
    campaigns: protectedProcedure.input(PaginationSchema).query(async () => ({ campaigns: [], total: 0, hasMore: false })),
  }),
});