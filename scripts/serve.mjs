import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
const { values } = parseArgs({
  options: {
    dir: { type: "string", default: "dist" },
    base: { type: "string", default: "" },
    port: { type: "string", default: process.env.PORT || "4173" },
  },
});
if (!["dist", "dist-pages"].includes(values.dir))
  throw new Error("Unsupported preview directory.");
const root = fileURLToPath(new URL(`../${values.dir}/`, import.meta.url));
const base = values.base.replace(/\/+$/, "");
if (!/^(\/[A-Za-z0-9._-]+)*$/.test(base))
  throw new Error("Unsupported preview base path.");
const port = Number(values.port);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};
export const server = createServer(async (req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    let pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (base && pathname === base) {
      res.writeHead(301, { Location: `${base}/` });
      res.end();
      return;
    }
    if (base && pathname.startsWith(`${base}/`))
      pathname = pathname.slice(base.length);
    else if (base) pathname = "/missing-preview-base-path";
    let path = resolve(root, `.${pathname}`);
    if (path !== resolve(root) && !path.startsWith(resolve(root) + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    let status = 200;
    try {
      if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
      await stat(path);
    } catch {
      path = resolve(root, "404.html");
      status = 404;
    }
    const body = await readFile(path);
    res.writeHead(status, {
      "Content-Type": mime[extname(path)] || "application/octet-stream",
      "Content-Length": body.length,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Blue Photo preview: http://127.0.0.1:${port}${base}/`),
);
