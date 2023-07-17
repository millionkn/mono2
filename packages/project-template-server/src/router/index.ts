import { z } from 'zod'
import { procedure, router } from '@src/router/trpc'
import { loadDataSource } from '@src/db/dataSource';
import { PersonEntitySchema } from '@src/db/entitySchema/person';
import { Like } from 'typeorm';

const dataSource = loadDataSource()
export const appRouter = router({
  test: procedure
    .input(z.string())
    .query((body) => {
      return { echo: body.input }
    }),
})
