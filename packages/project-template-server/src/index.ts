import '@mono/libs-polyfill';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from "./router"
import fastify from 'fastify';
import { exit } from 'process';
import { serverPort } from './env';

export type AppRouter = typeof appRouter

const server = fastify({
  maxParamLength: 5000,
  frameworkErrors: (err, req) => {
    console.log(req.url, req.params, req.body, err.message)
  },
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  },
});

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter },
});
server.listen({
  port: serverPort,
}, (err) => {
  if (err) {
    server.log.error(err)
    exit(1)
  }
});