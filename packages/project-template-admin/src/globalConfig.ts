import { createTRPCProxyClient, httpBatchLink, httpLink } from '@trpc/client';
import { AppRouter } from '@mono/project-template-server';
import { io } from 'socket.io-client';

export function baseUrl(str: string) {
  return '/' + `${import.meta.env.BASE_URL}/${str}`.split('/').filter((x) => x.length !== 0).join('/')
}

export const client = createTRPCProxyClient({
  links: [
    httpLink<AppRouter>({
      url: `http://localhost:3000/trpc`,
    }),
  ],
});