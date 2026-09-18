import http from "node:http";
import net from "node:net";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";
const root = dirname(fileURLToPath(import.meta.url)); const port = Number(process.env.PORT || 3000);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const json = (res, status, data) => { res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" }); res.end(JSON.stringify(data)); };
const body = req => new Promise((resolve, reject) => { let text = ""; req.setEncoding("utf8"); req.on("data", chunk => { text += chunk; if (text.length > 5_000_000) req.destroy(); }); req.on("end", () => resolve(text)); req.on("error", reject); });
function send(host, printerPort, zpl) { return new Promise((resolve, reject) => { if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}$/.test(host || "")) return reject(new Error("Enter a valid printer address.")); const socket = net.createConnection({ host, port: Number(printerPort) || 9100 }); socket.setTimeout(10000); socket.on("connect", () => socket.end(zpl, "utf8")); socket.on("timeout", () => socket.destroy(new Error("Timed out connecting to the printer."))); socket.on("error", reject); socket.on("close", failed => { if (!failed) resolve(); }); }); }
http.createServer(async (req, res) => { try { if (req.method === "POST" && req.url === "/api/print") { const data = JSON.parse(await body(req)); if (typeof data.zpl !== "string" || !data.zpl.startsWith("^XA")) throw new Error("No valid ZPL print job was supplied."); await send(data.host, data.printerPort, data.zpl); return json(res, 200, { ok: true }); }
  if (req.method === "POST" && req.url === "/api/test") { const data = JSON.parse(await body(req)); await send(data.host, data.printerPort, "^XA^FO40,40^A0N,36,36^FDZebra connection test OK^FS^XZ"); return json(res, 200, { ok: true }); }
  if (req.method === "GET") { const path = req.url === "/" ? join(root, "index.html") : join(root, decodeURIComponent(req.url).replace(/^\/+/, "")); if (!path.startsWith(root)) return json(res, 403, { error: "Forbidden" }); const content = await readFile(path); res.writeHead(200, { "Content-Type": mime[extname(path)] || "application/octet-stream" }); return res.end(content); }
  json(res, 404, { error: "Not found" }); } catch (error) { json(res, 400, { error: error instanceof Error ? error.message : "Unexpected error" }); } }).listen(port, "0.0.0.0", () => console.log(`Open http://localhost:${port}`));
