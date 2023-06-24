import { z } from 'zod'
import { trpc } from '@src/router/trpc'

export const appRouter = trpc.router({
  test: trpc.procedure.input(z.string()).query((body) => {
    return body.input
  }),
});
