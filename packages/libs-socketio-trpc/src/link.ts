import { Server } from "socket.io";
import { Server as HttpServer } from 'http'
import { Http2SecureServer } from 'http2'
import { Server as HttpsServer } from 'https'
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { AnyRouter } from "@trpc/server"
import { TRPCLink, TRPCClientError } from '@trpc/client';
import { io } from 'socket.io-client';
import { observable } from '@trpc/server/observable';
import { Observable, from, switchMap } from 'rxjs';
import { keepShare } from '@mono/libs-rxjs-operator'

export type SocketClient = ReturnType<typeof io>

export const clientLink = <Router extends AnyRouter>(opt: {
  client$: Observable<SocketClient>,
}): TRPCLink<Router> => {
  const socket$ = opt.client$.pipe(
    switchMap((socket) => new Observable<SocketClient | null>((subscriber) => {
      socket.on('disconnect', () => subscriber.next(null))
      socket.on('connect', () => subscriber.next(socket))
      if (socket.connected) { subscriber.next(socket) }
    })),
    keepShare(200),
  )
  return (runtime) => {
    return (opts) => {
      const input = runtime.transformer.serialize(opts.op.input);
      const { type, path, id } = opts.op;
      if (type !== 'query' && type !== 'mutation' && type !== 'subscription') {
        throw new Error(`unknown op type:'${type}'`)
      }
      const ob$ = socket$.pipe(
        (ob$) => {
          if (type === 'mutation' || type === 'query') {
            return ob$.pipe(
              switchMap((socket) => {
                if (socket === null) {
                  throw new Error(`socket reset,but ${type} '${path}' is not complate`)
                }
                return new Observable<any>((subscriber) => {
                  const msgCb = (msgStr: string) => {
                    if (typeof msgStr !== 'string') {
                      return subscriber.error(
                        new Error(`server response invalid,get ${msgStr}`)
                      )
                    }
                    let msg: any = null
                    try {
                      msg = JSON.parse(msgStr)
                    } catch (e) {
                      return subscriber.error(
                        new Error(`server response invalid(parse json),get ${msgStr}`)
                      )
                    }
                    if (typeof msg !== 'object' || msg === null || msg instanceof Array) {
                      return subscriber.error(
                        new Error(`server response invalid,get ${msgStr}`)
                      )
                    }
                    if (msg.type === 'reconnect' && msg.id === null) {
                      return subscriber.error(
                        new Error(`server send a 'reconnect' message,but ${type} is not complate`)
                      )
                    }
                    if (msg?.id !== id) { return }
                    subscriber.next(msg)
                    subscriber.complete()
                  }
                  socket.on('message', msgCb)
                  socket.send(JSON.stringify({
                    id,
                    method: type,
                    params: {
                      path,
                      input,
                    }
                  }))
                  return () => socket.off('message', msgCb)
                })
              })
            )
          } else {
            return ob$.pipe(
              switchMap((socket) => {
                if (socket === null) { return from([]) }
                return new Observable<any>((subscriber) => {
                  const msgCb = (msgStr: any) => {
                    if (typeof msgStr !== 'string') {
                      return subscriber.error(
                        new Error(`server response invalid,get ${msgStr}`)
                      )
                    }
                    let msg: any = null
                    try {
                      msg = JSON.parse(msgStr)
                    } catch (e) {
                      return subscriber.error(
                        new Error(`server response invalid(parse json),get ${msgStr}`)
                      )
                    }
                    if (typeof msg !== 'object' || msg === null || msg instanceof Array) {
                      return subscriber.error(
                        new Error(`server response invalid,get ${msgStr}`)
                      )
                    }
                    if (msg.type === 'reconnect' && msg.id === null) { return }
                    if (msg?.id !== id) { return }
                    const result = msg['result']
                    if (result.type === 'started') { return }
                    if (result.type === 'stoped') {
                      return subscriber.complete()
                    }
                    if (result.type === 'data') {
                      subscriber.next(msg)
                    }
                  }
                  socket.on('message', msgCb)
                  socket.send(JSON.stringify({
                    id,
                    method: type,
                    params: {
                      path,
                      input,
                    }
                  }))
                  return () => {
                    socket.send({ id, method: 'subscription.stop' })
                    socket.off('message', msgCb)
                  }
                })
              })
            )
          }
        }
      )
      return observable((observer) => {
        const subscribtion = ob$.subscribe({
          next: (v) => observer.next(v),
          error: (err) => observer.error(TRPCClientError.from(err)),
          complete: () => observer.complete(),
        })
        return () => subscribtion.unsubscribe()
      })
    }
  }
}

export function attachOnServer<TRouter extends AnyRouter>(opts: {
  io: Server,
  httpServer: HttpServer | HttpsServer | Http2SecureServer,
  router: TRouter,
}) {
  opts.io.attach(opts.httpServer, {
    //@ts-ignore
    cors: { origin: '*' },
  })
  applyWSSHandler({
    router: opts.router,
    wss: opts.io,
  })
}