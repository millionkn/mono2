import { z } from 'zod'
import { trpc } from '@src/router/trpc'
import { loadDataSource } from '@src/db/dataSource';
import { PersonEntitySchema } from '@src/db/entitySchema/person';
import { Like } from 'typeorm';

const dataSource = loadDataSource()
export const appRouter = trpc.router({
  test: trpc.procedure
    .input(z.string())
    .query((body) => {
      return { echo: body.input }
    }),
})
