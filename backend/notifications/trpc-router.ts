import { router, protectedProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';

export const notificationsRouter = router({
  list: protectedProcedure.input(PaginationSchema).query(async () => ({ notifications: [], total: 0, hasMore: false })),
});