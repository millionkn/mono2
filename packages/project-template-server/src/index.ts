import '@mono/libs-polyfill';
import { appRouter } from "./router"
import fastify from 'fastify';
import { exit } from 'process';
import { serverPort } from './env';
import cors from '@fastify/cors'
import { Server } from 'socket.io'
import fp from 'fastify-plugin'
import { applyWSSHandler } from '@trpc/server/adapters/ws';

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

fastifyInstance.register(fp(async (instance) => {
  //@ts-ignore
  const io = new Server({
    path: "/trpc/socket.io",
    cors: { origin: '*' },
  })
  io.attach(instance.server)
  applyWSSHandler({
    wss: io,
    router: appRouter,
    createContext:()=>{

    }
  });
  instance.addHook('onClose', (_, done) => io.close((err) => done(err)))
}));
fastifyInstance.register(cors)

await fastifyInstance.listen({
  host: '0.0.0.0',
  port: serverPort,
}).catch((err) => {
  fastifyInstance.log.error(err)
  exit(1)
});