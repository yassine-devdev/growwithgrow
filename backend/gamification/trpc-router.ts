import { router, protectedProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';

export const gamificationRouter = router({
  achievements: router({
    list: protectedProcedure.input(PaginationSchema).query(async () => ({ achievements: [], total: 0, hasMore: false })),
  }),
});