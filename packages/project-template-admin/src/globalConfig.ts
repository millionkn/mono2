import { CreateTRPCProxyClient, createTRPCProxyClient } from '@trpc/client';
import { Socket, io } from 'socket.io-client';
import { AppRouter } from '@mono/project-template-server'
import { clientLink } from '@mono/libs-socketio-trpc'
import { Observable } from 'rxjs';
import { keepReplay } from '@mono/libs-rxjs-operator';
import { baseUrl } from './tools/baseUrl';

const socket$ = import.meta.env.VITE_Server_Host
  .isOneOf(['', '/'])
  .pipeValue((v) => {
    const path = baseUrl(import.meta.env.VITE_Api, `/trpc/socket.io`)
    return new Observable<Socket | null>((subscriber) => {
      const client = v ? io({ path }) : io(import.meta.env.VITE_Server_Host, { path })
      client.on('connect', () => subscriber.next(client))
      client.on('disconnect', () => subscriber.next(null))
      return () => client.disconnect()
    }).pipe(keepReplay(2000))
  })

export const trpcClient: CreateTRPCProxyClient<AppRouter> = createTRPCProxyClient<AppRouter>({
  links: [
    clientLink({
      socket$
    }),
  ],
});