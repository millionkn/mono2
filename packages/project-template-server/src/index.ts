import '@mono/libs-polyfill';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from "./router"
import fastify from 'fastify';
import { exit } from 'process';
import { serverPort } from './env';
import cors from '@fastify/cors'

export type AppRouter = typeof appRouter

const server = fastify({
  logger: true
});
server.get(`/xxx`, async () => {
  return 'test'
})
server.register(cors)
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