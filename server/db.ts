import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import path from "path";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    try {
      // Caminho do banco SQLite local
      const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
      
      // Criar cliente libsql (funciona localmente e na Vercel)
      const client = createClient({
        url: `file:${dbPath}`
      });
      
      _db = drizzle(client);
      
      console.log(`[Database] LibSQL connected at ${dbPath}`);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Salva uma consulta de conta no histórico
 */
export async function saveAccountQuery(query: {
  userId?: number;
  uid: string;
  nickname?: string;
  level?: number;
  xp?: number;
  accountId?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save account query: database not available");
    return;
  }

  const { accountQueries } = await import("../drizzle/schema");
  
  await db.insert(accountQueries).values({
    userId: query.userId,
    uid: query.uid,
    nickname: query.nickname ?? null,
    level: query.level ?? null,
    xp: query.xp ?? null,
    accountId: query.accountId ?? null,
  });
}

/**
 * Busca histórico de consultas de um usuário
 */
export async function getUserAccountQueries(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get account queries: database not available");
    return [];
  }

  const { accountQueries } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(accountQueries)
    .where(eq(accountQueries.userId, userId))
    .orderBy(desc(accountQueries.queriedAt))
    .limit(limit);

  return result;
}

