import '@mono/libs-polyfill';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from "./router"
import fastify from 'fastify';
import { env, exit } from 'process';

export type AppRouter = typeof appRouter

const server = fastify({
  maxParamLength: 5000,
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
  port: env['Server_Port']?.asNumber() ?? 3000
}, (err) => {
  if (err) {
    server.log.error(err)
    exit(1)
  }
});