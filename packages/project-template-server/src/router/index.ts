import { z } from 'zod'
import { procedure, router } from '@src/router/trpc'
import { loadDataSource } from '@src/db/dataSource';
import { PersonEntitySchema } from '@src/db/entitySchema/person';
import { Like } from 'typeorm';
import { observable } from '@trpc/server/observable';

const dataSource = loadDataSource()
export const appRouter = router({
  test: procedure
    .input(z.string())
    .subscription((body) => {
      return observable<{ echo: string, index: number }>((observer) => {
        let i = 0
        const x = setInterval(() => {
          observer.next({ echo: body.input, index: i++ })
        }, 3000)
        return () => clearInterval(x)
      })

    }),
})
