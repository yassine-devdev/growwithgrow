import { router, protectedProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';

export const marketplaceRouter = router({
  products: router({
    list: protectedProcedure.input(PaginationSchema).query(async () => ({ products: [], total: 0, hasMore: false })),
  }),
});