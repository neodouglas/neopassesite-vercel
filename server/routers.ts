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
      .mutation(async ({ input, ctx }) => {
        const { parseAccountInput, fetchAccountInfo } = await import('./freefire');
        const { saveAccountQuery } = await import('./db');
        
        // Parseia entrada do usuário
        const credentials = parseAccountInput(input.input);
        if (!credentials) {
          throw new Error('Formato de entrada inválido. Use UID:PASSWORD ou o formato JSON da Garena.');
        }
        
        // Consulta API externa
        const accountInfo = await fetchAccountInfo(credentials);
        
        // Salva no histórico (se usuário estiver logado)
        if (ctx.user) {
          await saveAccountQuery({
            userId: ctx.user.id,
            uid: credentials.uid,
            nickname: accountInfo.nickname,
            level: accountInfo.level,
            xp: accountInfo.xp,
            accountId: accountInfo.id.toString(),
          });
        }
        
        return {
          success: true,
          data: accountInfo,
        };
      }),
    
    /**
     * Busca histórico de consultas do usuário
     */
    history: publicProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) {
          return [];
        }
        
        const { getUserAccountQueries } = await import('./db');
        return await getUserAccountQueries(ctx.user.id, 20);
      }),
  }),
});

export type AppRouter = typeof appRouter;
