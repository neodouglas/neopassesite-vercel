// api/[...path].ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import handler from "./index"; // reutiliza o mesmo handler do index


export default function all(req: VercelRequest, res: VercelResponse) {
// Garante que o Express veja a URL com prefixo /api
// Exemplos de entrada:
// /api/trpc/system.ping -> mantém como /api/trpc/system.ping
// /api -> mantém /api
if (!req.url.startsWith("/api")) {
const hasQ = req.url.includes("?");
const [pathname, search = ""] = hasQ ? req.url.split("?") : [req.url, ""];
const fixed = "/api" + (pathname.startsWith("/") ? pathname : "/" + pathname) + (search ? "?" + search : "");
Object.defineProperty(req, "url", { value: fixed, writable: true });
}
return (handler as any)(req, res);
}