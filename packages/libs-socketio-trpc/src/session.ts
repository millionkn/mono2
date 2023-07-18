import { AnyRouter } from "@trpc/server"
import { TRPCLink } from '@trpc/client';

export const sessionLink = <Router extends AnyRouter>(opt: {
  save: (value: string) => void,
  load: () => string | null,
}): TRPCLink<Router> => {
  return (runtime) => {
    return (opts) => {
      const { type, path, id } = opts.op;
      throw 'todo'
    }
  }
}