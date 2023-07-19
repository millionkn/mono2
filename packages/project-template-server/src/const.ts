import { TRPCError, initTRPC } from '@trpc/server';
import { Socket } from 'socket.io';
import { z } from 'zod';

export type Session = null | {
  type: 'admin'
} | {
  type: 'person',
  personId: string,
}

export type SessionManager = {
  setSession: (session: Session) => void,
  getSession: () => Session,
}

export type Context = {
  sessionManager: SessionManager,
}

export const createContext = (socket: Socket): Context => {
  const authToken = socket.handshake.auth['auth-token']
  let rawSession: Session = null
  if (typeof authToken === 'string') {
    try {
      rawSession = z.object({
        type: z.enum(['admin']),
      }).or(z.object({
        type: z.enum(['person']),
        personId: z.string().nonempty(),
      })).parse(JSON.parse(authToken))
    } catch {
      rawSession = null
    }
  }
  return {
    sessionManager: {
      getSession: () => rawSession,
      setSession: (session) => socket.send({
        type: 'set-auth-token',
        authToken: JSON.stringify(rawSession = session),
      })
    },
  }
}

const trpc = initTRPC.context<Context>().create();

export const middleware = trpc.middleware;
export const router = trpc.router;
export const publicProcedure = trpc.procedure
export const authProcedure = trpc.procedure.use(middleware((opts) => {
  const session = opts.ctx.sessionManager.getSession()
  if (session === null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next({
    ctx: {
      session,
      sessionManager: opts.ctx.sessionManager,
    } satisfies Context & { session: NonNullable<Session> },
  })
}));