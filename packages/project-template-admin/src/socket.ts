import { CreateTRPCProxyClient, createTRPCProxyClient } from '@trpc/client';
import { Socket, io } from 'socket.io-client';
import { AppRouter } from '@mono/project-template-server'
import { ioLink } from '@mono/libs-socketio-trpc'
import { Observable, switchMap } from 'rxjs';
import { keepReplay } from '@mono/libs-rxjs-operator';
import { baseUrl } from './tools/baseUrl';

const localStorageKey = baseUrl('auth-token')

const socket$ = import.meta.env.VITE_Server_Host
  .isOneOf(['', '/'])
  .pipeValue((v) => {
    const path = baseUrl(import.meta.env.VITE_Api, `/trpc/socket.io`)
    return new Observable<Socket | null>((subscriber) => {
      const client = v ? io({
        path,
        auth: {
          ['auth-token']: localStorage.getItem(localStorageKey) ?? null,
        }
      }) : io(import.meta.env.VITE_Server_Host, {
        path,
        auth: {
          ['auth-token']: localStorage.getItem(localStorageKey) ?? null,
        }
      })
      client.on('connect', () => subscriber.next(client))
      client.on('disconnect', () => subscriber.next(null))
      return () => client.disconnect()
    }).pipe(keepReplay(2000))
  })

export const trpcClient: CreateTRPCProxyClient<AppRouter> = createTRPCProxyClient<AppRouter>({
  links: [
    ioLink({
      socket$,
      dataPipe: (ob$) => ob$.pipe(
        switchMap((msg) => {
          if (msg['type'] === 'set-auth-token') {
            localStorage.setItem(localStorageKey, msg['authToken'])
            return []
          }
          return [msg]
        }),
      ),
    }),
  ],
});