import { TRPCLink, TRPCClientError } from '@trpc/client';
import { io } from 'socket.io-client';
import { observable } from '@trpc/server/observable';
import { AnyRouter } from '@trpc/server'
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
      const { type, path, id, context } = opts.op;
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
                  const msgCb = (msg: any) => {
                    if (msg.type === 'reconnect' && msg.id === null) {
                      return subscriber.error(
                        new Error(`server send a 'reconnect' message,but ${type} is not complate`)
                      )
                    }
                    if (msg?.id !== id) { return }
                    const result = msg['result']
                    subscriber.next(result.data)
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
                  const msgCb = (msg: any) => {
                    if (msg.type === 'reconnect' && msg.id === null) { return }
                    if (msg?.id !== id) { return }
                    const result = msg['result']
                    if (result.type === 'started') { return }
                    if (result.type === 'stoped') {
                      return subscriber.complete()
                    }
                    if (result.type === 'data') {
                      subscriber.next(result.data)
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