import { router, protectedProcedure } from '../trpc/router';

export const settingsRouter = router({
  system: router({
    get: protectedProcedure.query(async () => ({ settings: {} })),
  }),
});