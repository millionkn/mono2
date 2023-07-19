import { publicProcedure, router } from "@src/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const authRouter = router({
  login: publicProcedure
    .input(z.object({
      username: z.string().nonempty(),
      password: z.string().nonempty(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.username === 'admin' && input.password === '123456') {
        ctx.sessionManager.setSession({
          type: 'admin'
        })
      } else {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '用户名或密码不正确',
        })
      }
    })
})