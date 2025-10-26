import type { InsertUser, User } from "../drizzle/schema";

// Arquivo mantido para compatibilidade
// Banco de dados removido para simplificar deploy na Vercel

export async function getDb() {
  return null;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  // No-op: banco de dados desabilitado
  console.log('[DB] upsertUser called but database is disabled');
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  // No-op: banco de dados desabilitado
  console.log('[DB] getUserByOpenId called but database is disabled');
  return undefined;
}

