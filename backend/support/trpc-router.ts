import { router, protectedProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';

export const supportRouter = router({
  tickets: router({
    list: protectedProcedure.input(PaginationSchema).query(async () => ({ tickets: [], total: 0, hasMore: false })),
  }),
});