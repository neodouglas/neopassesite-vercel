import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  account: router({
    /**
     * Consulta informações de uma conta Free Fire
     */
    query: publicProcedure
      .input((val: unknown) => {
        if (typeof val !== 'object' || val === null || !('input' in val)) {
          throw new Error('Input inválido');
        }
        const input = val.input;
        if (typeof input !== 'string' || input.trim().length === 0) {
          throw new Error('Entrada de dados inválida');
        }
        return { input: input as string };
      })
      .mutation(async ({ input }) => {
        const { parseAccountInput, fetchAccountInfo } = await import('./freefire');
        
        // Parseia entrada do usuário
        const credentials = parseAccountInput(input.input);
        if (!credentials) {
          throw new Error('Formato de entrada inválido. Use UID:PASSWORD ou o formato JSON da Garena.');
        }
        
        // Consulta API externa
        const accountInfo = await fetchAccountInfo(credentials);
        
        return {
          success: true,
          data: accountInfo,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

