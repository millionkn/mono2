import '@mono/libs-polyfill';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from "./router"
import fastify from 'fastify';
import { exit } from 'process';
import { serverPort } from './env';
import cors from '@fastify/cors'
import socketIO from 'fastify-socket.io'
export type AppRouter = typeof appRouter

const server = fastify({
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

server.register(cors)
server.register(socketIO)
server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  log: true,
  trpcOptions: {
    router: appRouter,
  },
});

await server.listen({
  host: '0.0.0.0',
  port: serverPort,
}).catch((err) => {
  server.log.error(err)
  exit(1)
});