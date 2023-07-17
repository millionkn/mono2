import '@mono/libs-polyfill';
import { appRouter } from "./router"
import fastify from 'fastify';
import { exit } from 'process';
import { serverPort } from './env';
import cors from '@fastify/cors'
import { Server } from 'socket.io'
import fp from 'fastify-plugin'
import { attachOnServer } from '@mono/libs-socketio-trpc'

export type AppRouter = typeof appRouter

const fastifyInstance = fastify({
  disableRequestLogging: true,
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  },
});

fastifyInstance.register(cors)
fastifyInstance.register(fp(async (instance) => {
  const io = new Server({
    path: "/trpc/socket.io",
  })
  attachOnServer({
    io, 
    httpServer: instance.server, 
    router: appRouter,
  })
  instance.addHook('onClose', (_, done) => io.close((err) => done(err)))
}));

await fastifyInstance.listen({
  host: '0.0.0.0',
  port: serverPort,
}).catch((err) => {
  fastifyInstance.log.error(err)
  exit(1)
});