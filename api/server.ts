// Vercel Serverless Function Entry Point (Source)
import { createApp } from '../server/_core/index';

let app: any;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await createApp();
  }
  return app(req, res);
}

