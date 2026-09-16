/* Production demo preview with SPA fallback. No backend or extra dependencies required. */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../dist");
const port = Number(process.env.PORT || 4173);
const base = "/" + (process.env.DEPLOY_BASE || "").replace(/^\/+|\/+$/g, "");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".wasm": "application/wasm" };
if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error("Run npm run build:demo first.");
  process.exit(1);
}

http.createServer((req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405).end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { res.writeHead(400).end(); return; }
  if (base !== "/" && pathname !== base && !pathname.startsWith(base + "/")) { res.writeHead(404).end(); return; }
  if (base !== "/") pathname = pathname.slice(base.length);
  let file = path.resolve(root, "." + (pathname || "/"));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (pathname.startsWith("/api/")) { res.writeHead(404, { "Content-Type": "application/json" }).end('{"code":404}'); return; }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    if (path.extname(pathname)) { res.writeHead(404).end(); return; }
    file = path.join(root, "index.html");
  }
  let size;
  try { size = fs.statSync(file).size; }
  catch { res.writeHead(503, { "Retry-After": "2" }).end("Build in progress. Please retry."); return; }
  res.writeHead(200, {
    "Content-Type": types[path.extname(file)] || "application/octet-stream",
    "Content-Length": size,
    "Cache-Control": /\.[a-f0-9]{8}\./.test(file) ? "public, max-age=31536000, immutable" : "no-cache",
  });
  if (req.method === "HEAD") res.end();
  else fs.createReadStream(file).on("error", () => res.destroy()).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`Demo preview: http://127.0.0.1:${port}${base}`));
