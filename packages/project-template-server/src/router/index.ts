import { trpc } from '@src/router/trpc.js'
import { z } from 'zod'

export const appRouter = trpc.router({
  test: trpc.procedure.input(z.string()).query((body) => {
    return body.input
  }),
});
