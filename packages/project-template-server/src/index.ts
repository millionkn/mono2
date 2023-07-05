import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import '@mono/libs-polyfill';
import { a } from '@src/test'
import fs from 'fs'

type A = typeof a
// export type AppRouter = typeof appRouter
1..times(()=>{
  
  console.log(a as A, typeof fs.Dir,typeof fastifyTRPCPlugin)
})



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