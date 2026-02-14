import { Hono } from "hono";
import { cors } from "hono/cors";
import { setCookie, getCookie } from "hono/cookie";
import { WorkflowyClient } from "./workflowy-v1";
import { encrypt, decrypt } from "./crypto";
import type { Env } from "../types";

type AppEnv = { Bindings: Env };

const api = new Hono<AppEnv>();

// CORS middleware
api.use("*", async (c, next) => {
  const allowed = c.env.ALLOWED_ORIGINS?.split(",").map((s) => s.trim()) || [];
  return cors({ origin: allowed, credentials: true })(c, next);
});

// Extract API key from encrypted cookie
async function getApiKey(c: { env: Env; req: { raw: Request }; cookie: (name: string) => string | undefined }): Promise<string> {
  const token = getCookie(c as never, "auth");
  if (!token) throw new Error("Not authenticated. Please set your API key.");
  try {
    return await decrypt(token, c.env.ENCRYPTION_KEY);
  } catch {
    throw new Error("Invalid auth cookie. Please re-enter your API key.");
  }
}

// Auth: encrypt API key and set as HTTP-Only cookie
api.post("/auth", async (c) => {
  const { apiKey } = await c.req.json<{ apiKey: string }>();
  if (!apiKey) return c.json({ error: "apiKey required" }, 400);

  const encrypted = await encrypt(apiKey, c.env.ENCRYPTION_KEY);
  setCookie(c, "auth", encrypted, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return c.json({ ok: true });
});

// Auth check
api.get("/auth/check", async (c) => {
  try {
    await getApiKey(c as never);
    return c.json({ authenticated: true });
  } catch {
    return c.json({ authenticated: false });
  }
});

// Logout: clear cookie
api.post("/auth/logout", async (c) => {
  setCookie(c, "auth", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: 0,
  });
  return c.json({ ok: true });
});

api.get("/nodes", async (c) => {
  const apiKey = await getApiKey(c as never);
  const parentId = c.req.query("parent_id") || "None";
  const client = new WorkflowyClient(apiKey);
  const nodes = await client.getNodes(parentId);
  return c.json(nodes);
});

api.post("/nodes", async (c) => {
  const apiKey = await getApiKey(c as never);
  const body = await c.req.json<{
    parent_id: string;
    name: string;
    note?: string;
  }>();
  const client = new WorkflowyClient(apiKey);
  const result = await client.createNode(body.parent_id, body.name, body.note);
  return c.json(result);
});

api.post("/send", async (c) => {
  const apiKey = await getApiKey(c as never);
  const body = await c.req.json<{
    destinationId: string;
    name: string;
    note?: string;
    dailyNoteEnabled: boolean;
    localDate?: string;
  }>();
  const client = new WorkflowyClient(apiKey);

  let parentId = body.destinationId;
  if (body.dailyNoteEnabled) {
    parentId = await client.getOrCreateDailyNote(parentId, body.localDate);
  }

  const result = await client.createNode(parentId, body.name, body.note);
  return c.json(result);
});

api.get("/history", async (c) => {
  const apiKey = await getApiKey(c as never);
  const parentId = c.req.query("parent_id");
  if (!parentId) return c.json({ error: "parent_id required" }, 400);

  const dailyNote = c.req.query("daily_note") === "true";
  const client = new WorkflowyClient(apiKey);

  if (dailyNote) {
    const dateNodes = await client.getNodes(parentId);
    const sorted = dateNodes.sort((a, b) => b.priority - a.priority);
    const recent = sorted.slice(0, 5);

    const results: { date: string; items: typeof dateNodes }[] = [];
    for (const dateNode of recent) {
      const children = await client.getNodes(dateNode.id);
      results.push({ date: dateNode.name, items: children });
    }
    return c.json(results);
  }

  const nodes = await client.getNodes(parentId);
  return c.json(nodes.map((n) => ({ date: null, items: [n] })));
});

// SSRF protection for URL fetch
function isSafeUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const hostname = url.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return false;
    if (hostname.startsWith("10.") || hostname.startsWith("192.168.")) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false;
    if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return false;
    return true;
  } catch {
    return false;
  }
}

api.get("/fetch-title", async (c) => {
  const url = c.req.query("url");
  if (!url) return c.json({ error: "url required" }, 400);
  if (!isSafeUrl(url)) return c.json({ title: url });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      headers: { "User-Agent": "Jotflowy/1.0" },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const html = await res.text();
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = match ? match[1].trim() : url;
    return c.json({ title });
  } catch {
    return c.json({ title: url });
  }
});

export default api;
