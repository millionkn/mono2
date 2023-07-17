import { createTRPCProxyClient } from '@trpc/client';
import { io } from 'socket.io-client';
import { AppRouter } from '@mono/project-template-server'

export function baseUrl(str: string) {
  return '/' + `${import.meta.env.BASE_URL}/${str}`.split('/').filter((x) => x.length !== 0).join('/')
}

export const socket: ReturnType<typeof io> = io('127.0.0.1:3000', {
  path: '/trpc/socket.io' || baseUrl(`/api/`),
})



export const client = createTRPCProxyClient<AppRouter>({
  links: [
    socketioLink({
      instance: socket,
    }),
  ],
});