import { Server, Socket } from "socket.io";
import { Server as HttpServer } from 'http'
import { Http2SecureServer } from 'http2'
import { Server as HttpsServer } from 'https'
import { parseMessage } from '@trpc/server/adapters/ws';
import { AnyRouter, MaybePromise, TRPCError, callProcedure, getTRPCErrorFromUnknown, inferRouterContext } from "@trpc/server"
import { TRPCLink } from '@trpc/client';
import { io } from 'socket.io-client';
import { Observable, from, switchMap } from 'rxjs';
import { fromRxjs } from "./tools";
import { Unsubscribable, isObservable } from "@trpc/server/observable";
import { JSONRPC2, TRPCClientOutgoingMessage, TRPCResponseMessage } from "@trpc/server/rpc";
import { getErrorShape, transformTRPCResponse } from "@trpc/server/shared";

type SocketClient = ReturnType<typeof io>

export const clientLink = <Router extends AnyRouter>(opt: {
  socket$: Observable<SocketClient | null>,
}): TRPCLink<Router> => {
  return (runtime) => {
    return (opts) => {
      const input = runtime.transformer.serialize(opts.op.input);
      const { type, path, id } = opts.op;
      if (type !== 'query' && type !== 'mutation' && type !== 'subscription') {
        throw new Error(`unknown op type:'${type}'`)
      }
      return fromRxjs(() => opt.socket$.pipe((ob$) => {
        if (type === 'mutation' || type === 'query') {
          return ob$.pipe(
            switchMap((socket) => {
              if (socket === null) {
                throw new Error(`socket is closed when ${type} '${path}' is not complate`)
              }
              return new Observable<any>((subscriber) => {
                const msgCb = async (msg: any) => {
                  if ('error' in msg) {
                    subscriber.error(msg)
                  } else {
                    subscriber.next(msg)
                    subscriber.complete()
                  }
                }
                socket.on('message', msgCb)
                socket.send({
                  id,
                  method: type,
                  params: {
                    path,
                    input,
                  }
                })
                return () => socket.off('message', msgCb)
              })
            })
          )
        } else {
          return ob$.pipe(
            switchMap((socket) => {
              if (socket === null) { return from([]) }
              return new Observable<any>((subscriber) => {
                const msgCb = async (msg: any) => {
                  if ('error' in msg) {
                    subscriber.error(msg)
                  } else {
                    subscriber.next(msg)
                  }
                }
                socket.on('message', msgCb)
                socket.send({
                  id,
                  method: type,
                  params: {
                    path,
                    input,
                  }
                })
                return () => {
                  socket.send({ id, method: 'subscription.stop' })
                  socket.off('message', msgCb)
                }
              })
            })
          )
        }
      }))
    }
  }
}

export function attachOnServer<TRouter extends AnyRouter>(opts: {
  onError?: (opt: {
    error: TRPCError;
    path: string | undefined;
    type: "subscription" | "query" | "mutation" | "unknown";
    ctx: inferRouterContext<TRouter> | undefined;
    input: unknown;
    client: Socket;
  }) => void;
  io: Server,
  httpServer: HttpServer | HttpsServer | Http2SecureServer,
  router: TRouter,
  createContext?: (socket: Socket) => MaybePromise<inferRouterContext<TRouter>>
}) {
  opts.io.attach(opts.httpServer, {
    //@ts-ignore
    cors: { origin: '*' },
  })
  const { io, createContext, router } = opts;
  const { transformer } = router._def._config;
  io.on('connection', async (client) => {
    const clientSubscriptions = new Map<number | string, Unsubscribable>();
    function respond(untransformedJSON: TRPCResponseMessage) {
      client.send(
        transformTRPCResponse(router._def._config, untransformedJSON),
      );
    }
    function stopSubscription(
      subscription: Unsubscribable,
      { id, jsonrpc }: { id: JSONRPC2.RequestId } & JSONRPC2.BaseEnvelope,
    ) {
      subscription.unsubscribe();
      respond({
        id,
        jsonrpc,
        result: {
          type: 'stopped',
        },
      });
    }
    const ctxPromise = createContext?.(client);
    let ctx: inferRouterContext<TRouter> | undefined = undefined;

    async function handleRequest(msg: TRPCClientOutgoingMessage) {
      const { id, jsonrpc } = msg;
      if (id === null) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '`id` is required',
        });
      }
      if (msg.method === 'subscription.stop') {
        const sub = clientSubscriptions.get(id);
        if (sub) {
          stopSubscription(sub, { id, jsonrpc });
        }
        clientSubscriptions.delete(id);
        return;
      }
      const { path, input } = msg.params;
      const type = msg.method;
      try {
        if (clientSubscriptions.has(id)) {
          throw new TRPCError({
            message: `Duplicate id ${id}`,
            code: 'BAD_REQUEST',
          });
        }
        await ctxPromise;
        const result = await callProcedure({
          procedures: router._def.procedures,
          path,
          rawInput: input,
          ctx,
          type,
        });
        if (type === 'subscription') {
          if (!isObservable(result)) {
            throw new TRPCError({
              message: `Subscription ${path} did not return an observable`,
              code: 'INTERNAL_SERVER_ERROR',
            });
          }
        } else {
          respond({
            id,
            jsonrpc,
            result: {
              type: 'data',
              data: result,
            },
          });
          return;
        }
        clientSubscriptions.set(id, result.subscribe({
          next(data) {
            respond({
              id,
              jsonrpc,
              result: {
                type: 'data',
                data,
              },
            });
          },
          error(err) {
            const error = getTRPCErrorFromUnknown(err);
            opts.onError?.({ error, path, type, ctx, input, client });
            respond({
              id,
              jsonrpc,
              error: getErrorShape({
                config: router._def._config,
                error,
                type,
                path,
                input,
                ctx,
              }),
            });
          },
          complete() {
            respond({
              id,
              jsonrpc,
              result: {
                type: 'stopped',
              },
            });
          },
        }));
        respond({
          id,
          jsonrpc,
          result: {
            type: 'started',
          },
        });
      } catch (cause) {
        const error = getTRPCErrorFromUnknown(cause);
        opts.onError?.({ error, path, type, ctx, input, client });
        respond({
          id,
          jsonrpc,
          error: getErrorShape({
            config: router._def._config,
            error,
            type,
            path,
            input,
            ctx,
          }),
        });
      }
    }
    client.on('message', async (message) => {
      try {
        const msgJSON: unknown = message;
        const msgs: unknown[] = Array.isArray(msgJSON) ? msgJSON : [msgJSON];
        const promises = msgs
          .map((raw) => parseMessage(raw, transformer))
          .map(handleRequest);
        await Promise.all(promises);
      } catch (cause) {
        const error = new TRPCError({
          code: 'PARSE_ERROR',
          cause: cause instanceof Error ? cause : undefined,
        });
        respond({
          id: null,
          error: getErrorShape({
            config: router._def._config,
            error,
            type: 'unknown',
            path: undefined,
            input: undefined,
            ctx: undefined,
          }),
        });
      }
    });
    client.on('error', (cause) => {
      opts.onError?.({
        ctx,
        error: getTRPCErrorFromUnknown(cause),
        input: undefined,
        path: undefined,
        type: 'unknown',
        client,
      });
    });

    client.once('disconnect', () => {
      for (const sub of clientSubscriptions.values()) {
        sub.unsubscribe();
      }
      clientSubscriptions.clear();
    });
    async function createContextAsync() {
      try {
        ctx = await ctxPromise;
      } catch (cause) {
        const error = getTRPCErrorFromUnknown(cause);
        opts.onError?.({
          error,
          path: undefined,
          type: 'unknown',
          ctx,
          client,
          input: undefined,
        });
        respond({
          id: null,
          error: getErrorShape({
            config: router._def._config,
            error,
            type: 'unknown',
            path: undefined,
            input: undefined,
            ctx,
          }),
        });
        client.disconnect();
      }
    }
    await createContextAsync();
  });
}