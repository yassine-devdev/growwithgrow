import { router, protectedProcedure } from '../trpc/router';
import { PaginationSchema } from '../shared/types';

export const knowledgeRouter = router({
  curriculum: router({
    list: protectedProcedure.input(PaginationSchema).query(async () => ({ curriculum: [], total: 0, hasMore: false })),
  }),
});