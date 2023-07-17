import { Server } from "socket.io";
import http from 'http'
import { Http2SecureServer } from 'http2'
import { Server as HTTPSServer } from 'https'
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { AnyRouter } from "@trpc/server"

export function attachOnServer<TRouter extends AnyRouter>(opts: {
  io: Server,
  httpServer: http.Server | HTTPSServer | Http2SecureServer,
  router: TRouter,
}) {
  opts.io.attach(opts.httpServer, {
    //@ts-ignore
    cors: { origin: '*' },
  })
  applyWSSHandler({
    router: opts.router,
    wss: opts.io,
  })
}