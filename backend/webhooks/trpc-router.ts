import { router, protectedProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';

export const webhooksRouter = router({
  endpoints: router({
    list: protectedProcedure.input(PaginationSchema).query(async () => ({ endpoints: [], total: 0, hasMore: false })),
  }),
});