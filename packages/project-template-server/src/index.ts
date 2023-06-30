import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import {mergePipeLike} from '@mono/libs-polyfill';

import { a,BB } from '@src/test'
const z = await import('@src/test')
import CC = BB

CC.aa
type A = typeof a
// export type AppRouter = typeof appRouter
console.log(a as A,z.a as A,!!fastifyTRPCPlugin,!!mergePipeLike)


// import { appRouter } from "./router"
// import fastify from 'fastify';
// import { exit } from 'process';



// const server = fastify({
//   maxParamLength: 5000,
//   logger: {
//     transport: {
//       target: 'pino-pretty',
//       options: {
//         colorize: true
//       }
//     }
//   },
// });
// server.register(fastifyTRPCPlugin, {
//   prefix: '/trpc',
//   trpcOptions: { router: appRouter },
// });
// server.listen({ port: 3000 }, (err) => {
//   if (err) {
//     server.log.error(err)
//     exit(1)
//   }
// });