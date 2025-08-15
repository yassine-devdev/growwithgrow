import { router, protectedProcedure } from '../trpc/router';

export const storageRouter = router({
  upload: protectedProcedure.mutation(async () => ({ url: '', success: true })),
});