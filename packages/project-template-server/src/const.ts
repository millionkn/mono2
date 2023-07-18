import { TRPCError, initTRPC } from '@trpc/server';
import { Socket } from 'socket.io';

export type Context = {
  session: null | {
    type: 'admin'
  } | {
    type: 'person',
    personId: string,
  }
}

export const createContext = (socket: Socket): Context => {
  return {
    session: null
  }
}

const trpc = initTRPC.context<Context>().create();

export const middleware = trpc.middleware;
export const router = trpc.router;
export const publicProcedure = trpc.procedure
export const authProcedure = trpc.procedure.use(middleware((opts) => {
  if (opts.ctx.session === null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next({
    ctx: {
      session: opts.ctx.session,
    } satisfies Context,
  })
}));