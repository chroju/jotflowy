import { Hono } from "hono";
import { cors } from "hono/cors";
import { setCookie, getCookie } from "hono/cookie";
import { WorkflowyClient } from "./workflowy-v1";
import { encrypt, decrypt } from "./crypto";
import { addDays, dateKeysBack } from "./history";
import type { Env, HistoryGroup, WorkflowyNode } from "../types";

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
    targetType: "node" | "calendar";
    parentId?: string;
    name: string;
    note?: string;
  }>();

  // Workflowy creates the calendar day node on demand; "today" resolves
  // server-side, so no date handling is needed here.
  let parentId: string;
  if (body.targetType === "calendar") {
    parentId = "today";
  } else if (body.targetType === "node") {
    if (!body.parentId) return c.json({ error: "parentId required" }, 400);
    parentId = body.parentId;
  } else {
    return c.json({ error: "invalid targetType" }, 400);
  }

  const client = new WorkflowyClient(apiKey);
  const result = await client.createNode(parentId, body.name, body.note);
  return c.json(result);
});

const HISTORY_GROUP_LIMIT = 7;
// Cap per request; keep probes + dateId lookups well under the
// Cloudflare Workers subrequest limit (50).
const MAX_SCAN_DAYS = 31;
const PROBE_BATCH_SIZE = 7;

api.get("/history", async (c) => {
  const apiKey = await getApiKey(c as never);
  const client = new WorkflowyClient(apiKey);

  if (c.req.query("calendar") === "true") {
    const beforeDate = c.req.query("before_date");
    const localDate = c.req.query("local_date");
    // Scan backward from before_date - 1 when paginating; on initial load
    // start at local_date + 1 to cover client/Workflowy timezone skew.
    const anchor = beforeDate || localDate;
    if (!anchor || !/^\d{4}-\d{2}-\d{2}$/.test(anchor)) {
      return c.json({ error: "local_date or before_date (YYYY-MM-DD) required" }, 400);
    }
    const start = beforeDate ? addDays(beforeDate, -1) : addDays(anchor, 1);

    const collected: { date: string; items: WorkflowyNode[] }[] = [];
    let scanned = 0;
    while (scanned < MAX_SCAN_DAYS && collected.length < HISTORY_GROUP_LIMIT) {
      const batchKeys = dateKeysBack(
        addDays(start, -scanned),
        Math.min(PROBE_BATCH_SIZE, MAX_SCAN_DAYS - scanned)
      );
      const children = await Promise.all(batchKeys.map((key) => client.getCalendarNodes(key)));
      batchKeys.forEach((key, i) => {
        if (children[i].length > 0) collected.push({ date: key, items: children[i] });
      });
      scanned += batchKeys.length;
    }

    // Filled the page => likely more below; scan cap reached => end of scroll.
    const hasMore = collected.length >= HISTORY_GROUP_LIMIT;
    const recent = collected.slice(0, HISTORY_GROUP_LIMIT);

    const dayNodes = await Promise.all(
      recent.map((group) => client.getNode(group.date).catch(() => null))
    );
    const results: HistoryGroup[] = recent.map((group, i) => ({
      date: group.date,
      dateId: dayNodes[i]?.id ?? null,
      items: group.items,
      hasMore: false,
    }));
    if (results.length > 0) results[results.length - 1].hasMore = hasMore;

    return c.json(results);
  }

  const parentId = c.req.query("parent_id");
  if (!parentId) return c.json({ error: "parent_id required" }, 400);

  const nodes = await client.getNodes(parentId);
  return c.json(nodes.map((n) => ({ date: null, dateId: null, items: [n], hasMore: false })));
});

// Complete node
api.post("/nodes/:id/complete", async (c) => {
  const apiKey = await getApiKey(c as never);
  const nodeId = c.req.param("id");
  const client = new WorkflowyClient(apiKey);
  await client.completeNode(nodeId);
  return c.json({ ok: true });
});

// Delete node
api.delete("/nodes/:id", async (c) => {
  const apiKey = await getApiKey(c as never);
  const nodeId = c.req.param("id");
  const client = new WorkflowyClient(apiKey);
  await client.deleteNode(nodeId);
  return c.json({ ok: true });
});

// Uncomplete node
api.post("/nodes/:id/uncomplete", async (c) => {
  const apiKey = await getApiKey(c as never);
  const nodeId = c.req.param("id");
  const client = new WorkflowyClient(apiKey);
  await client.uncompleteNode(nodeId);
  return c.json({ ok: true });
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
