// Standalone API for Vercel Serverless
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import axios from 'axios';
import crypto from 'crypto';

// Crypto utilities
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey() {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
  const authTag = Buffer.from(
    encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2),
    'hex'
  );
  const encrypted = encryptedData.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Free Fire API utilities
interface Credentials {
  uid: string;
  password: string;
}

function parseAccountInput(input: string): Credentials | null {
  const trimmed = input.trim();
  
  // Formato UID:PASSWORD
  if (trimmed.includes(':') && !trimmed.includes('{')) {
    const [uid, password] = trimmed.split(':');
    if (uid && password) {
      return { uid: uid.trim(), password: password.trim() };
    }
  }
  
  // Formato JSON da Garena
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.guest_account_info) {
      const uid = parsed.guest_account_info['com.garena.msdk.guest_uid'];
      const password = parsed.guest_account_info['com.garena.msdk.guest_password'];
      if (uid && password) {
        return { uid, password };
      }
    }
  } catch (e) {
    // Não é JSON válido
  }
  
  return null;
}

async function fetchAccountInfo(credentials: Credentials) {
  const encryptedUid = encrypt(credentials.uid);
  const encryptedPassword = encrypt(credentials.password);
  
  try {
    const response = await axios.get('https://main.ffapi.cloud/api/freefire/account/guest/info', {
      params: {
        uid: credentials.uid,
        password: credentials.password,
      },
      timeout: 10000,
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Network Error: ${error.message}`);
  }
}

// tRPC setup
const t = initTRPC.create();

const appRouter = t.router({
  account: t.router({
    query: t.procedure
      .input(z.object({ input: z.string() }))
      .mutation(async ({ input }) => {
        const credentials = parseAccountInput(input.input);
        if (!credentials) {
          throw new Error('Formato de entrada inválido. Use UID:PASSWORD ou o formato JSON da Garena.');
        }
        
        const accountInfo = await fetchAccountInfo(credentials);
        
        return {
          success: true,
          data: accountInfo,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// Express app
let app: express.Express | null = null;

async function createApp() {
  if (app) return app;
  
  app = express();
  app.use(express.json({ limit: '50mb' }));
  
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext: () => ({}),
    })
  );
  
  return app;
}

// Vercel serverless handler
export default async function handler(req: any, res: any) {
  const expressApp = await createApp();
  return expressApp(req, res);
}

