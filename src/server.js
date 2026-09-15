#!/usr/bin/env node
/**
 * server.js — OpenCodeWEB A2A agent (Google A2A JSON-RPC 2.0).
 *  GET /.well-known/agent.json  → AgentCard
 *  POST /  {jsonrpc:"2.0", method, params, id}
 *    methods: message/send, message/stream (SSE), tasks/get, tasks/cancel
 */
import http from "node:http";
import { SKILLS, EXECUTORS } from "./skills.js";

const PORT = Number(process.env.PORT || 8788);
const BASE = process.env.A2A_BASE || `http://localhost:${PORT}`;
const tasks = new Map();
let seq = 0;

export function agentCard() {
  return {
    name: "opencodeweb",
    description: "Sovereign GDBx/DSGx/GDMx agent — sync, names, payments, support. Free, MIT, 0% fee.",
    url: BASE,
    version: "1.0.0",
    capabilities: { streaming: true },
    skills: SKILLS,
  };
}

function send(res, code, obj, headers = {}) {
  res.writeHead(code, { "content-type": "application/json", "access-control-allow-origin": "*", ...headers });
  res.end(JSON.stringify(obj));
}
const rpcOk = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcErr = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function runTask(skillId, params) {
  const fn = EXECUTORS[skillId];
  if (!fn) throw new Error(`unknown skill: ${skillId}`);
  return fn(params);
}

export async function handleMessage(params = {}) {
  const skillId = params.skillId || params.skill || "gdbx-names";
  const skillParams = params.params || params.arguments || {};
  const id = `task-${++seq}-${Date.now()}`;
  const task = { id, skillId, status: "working", createdAt: Date.now() };
  tasks.set(id, task);
  try {
    const artifact = await runTask(skillId, skillParams);
    task.status = "completed";
    task.artifact = artifact;
  } catch (e) {
    task.status = "failed";
    task.error = e.message;
  }
  tasks.set(id, task);
  return task;
}

const server = http.createServer(async (req, res) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.writeHead(204).end();
  try {
    if (req.method === "GET" && req.url === "/.well-known/agent.json") return send(res, 200, agentCard());
    if (req.method === "GET" && (req.url === "/" || req.url === "/health")) return send(res, 200, { ok: true, agent: "opencodeweb" });
    if (req.method === "POST" && req.url === "/") {
      let body = "";
      for await (const c of req) body += c;
      const { method, params, id } = JSON.parse(body || "{}");
      if (method === "message/send") return send(res, 200, rpcOk(id ?? 1, await handleMessage(params)));
      if (method === "message/stream") {
        res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
        const t = await handleMessage(params);
        res.write(`event: task\ndata: ${JSON.stringify(t)}\n\n`);
        return res.end();
      }
      if (method === "tasks/get") {
        const t = tasks.get(params?.id);
        if (!t) return send(res, 200, rpcErr(id ?? 1, -32001, "task not found"));
        return send(res, 200, rpcOk(id ?? 1, t));
      }
      if (method === "tasks/cancel") {
        const t = tasks.get(params?.id);
        if (!t) return send(res, 200, rpcErr(id ?? 1, -32001, "task not found"));
        t.status = "canceled";
        return send(res, 200, rpcOk(id ?? 1, t));
      }
      return send(res, 200, rpcErr(id ?? 1, -32601, `unknown method: ${method}`));
    }
    return send(res, 404, { error: "use GET /.well-known/agent.json or POST / JSON-RPC" });
  } catch (e) {
    return send(res, 500, { error: String(e.message || e) });
  }
});

if (process.argv[1]?.endsWith("server.js")) {
  server.listen(PORT, () => console.log(`opencodeweb-a2a on :${PORT} — /.well-known/agent.json`));
}
