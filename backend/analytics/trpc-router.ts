import { router, protectedProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';

export const analyticsRouter = router({
  events: router({
    list: protectedProcedure.input(PaginationSchema).query(async () => ({ events: [], total: 0, hasMore: false })),
  }),
});