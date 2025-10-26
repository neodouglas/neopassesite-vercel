import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type Server } from "http";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";


// __dirname compatível com ESM (substitui import.meta.dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


interface SetupOpts {
app: Express;
server?: Server;
dev?: boolean;
}


export async function setupVite({ app, dev = process.env.NODE_ENV !== "production" }: SetupOpts) {
if (dev) {
const vite = await createViteServer({
...(viteConfig as any),
server: { middlewareMode: true },
appType: "custom",
} as any);


app.use(vite.middlewares);


const clientTemplate = path.resolve(__dirname, "../..", "client", "index.html");


app.get(/^(?!\/api\b).*/, async (req, res, next) => {
try {
let template = fs.readFileSync(clientTemplate, "utf-8");
template = await vite.transformIndexHtml(req.originalUrl, template);
res.setHeader("Content-Type", "text/html; charset=utf-8");
res.status(200).end(template);
} catch (err) {
next(err);
}
});
} else {
serveStatic(app);
}
}


export function serveStatic(app: Express) {
// Em produção esperamos que o build do Vite vá para server/_core/public
const distPath = path.resolve(__dirname, "public");


if (fs.existsSync(distPath)) {
app.use(express.static(distPath, { maxAge: "1y", index: false }));


// Qualquer rota que não seja /api serve o index.html (SPA)
app.get(/^(?!\/api\b).*/, (_req, res) => {
const htmlPath = path.join(distPath, "index.html");
const html = fs.readFileSync(htmlPath, "utf-8");
res.setHeader("Content-Type", "text/html; charset=utf-8");
res.status(200).end(html);
});
} else {
// Evita crash caso o build não exista
app.get(/^(?!\/api\b).*/, (_req, res) => res.status(404).send("Build não encontrado"));
}
}