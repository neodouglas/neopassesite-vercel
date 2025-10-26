// Vercel Serverless Function Entry Point
import { createApp } from '../server/_core/index.ts';

let app;

export default async function handler(req, res) {
  if (!app) {
    app = await createApp();
  }
  return app(req, res);
}

