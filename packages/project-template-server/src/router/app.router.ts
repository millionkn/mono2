import { z } from 'zod'
import { authProcedure, publicProcedure, router } from '@src/const'
import { loadDataSource } from '@src/db/dataSource';
import { PersonEntitySchema } from '@src/db/entitySchema/person';
import { Like } from 'typeorm';
import { observable } from '@trpc/server/observable';
import { map, take, tap, timer } from 'rxjs';
import { fromRxjs } from '@mono/libs-socketio-trpc';


export const appRouter = router({
  test: publicProcedure
    .input(z.string())
    .subscription(({ ctx, input }) => fromRxjs(() => {
      return timer(0, 500).pipe(
        tap((i) => console.log('emit', i)),
        map((v) => ({ echo: input, index: v })),
        take(10),
      )
    }))
})
