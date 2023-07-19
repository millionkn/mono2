import { router } from '@src/const'
import { authRouter } from './auth.router';

export const appRouter = router({
  auth: authRouter,
})
