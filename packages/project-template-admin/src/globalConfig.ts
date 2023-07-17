import { createTRPCProxyClient } from '@trpc/client';
import { io } from 'socket.io-client';
import { AppRouter } from '@mono/project-template-server'
import { clientLink } from '@mono/libs-socketio-trpc'
import { of } from 'rxjs';

export function baseUrl(str: string) {
  return '/' + `${import.meta.env.VITE_Base_Url}/${str}`.split('/').filter((x) => x.length !== 0).join('/')
}

const socket: ReturnType<typeof io> = import.meta.env.VITE_Server_Host
  .isOneOf(['', '/'])
  .pipeValue((v) => {
    if (v) {
      return io({
        path: baseUrl(`/api/trpc/socket.io`),
      })
    } else {
      return io(import.meta.env.VITE_Server_Host, {
        path: baseUrl(`/api/trpc/socket.io`),
      })
    }
  })

export const client: ReturnType<typeof createTRPCProxyClient<AppRouter>> = createTRPCProxyClient<AppRouter>({
  links: [
    clientLink({
      client$: of(socket),
    }),
  ],
});