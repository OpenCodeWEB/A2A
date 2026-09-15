/**
 * skills.js — A2A skill executors backed by the live sovereign mesh.
 */
export const WORKER = process.env.GDBX_WORKER || "https://gdbx.xup.workers.dev";

async function getJSON(url, opts = {}) {
  const r = await fetch(url, opts);
  const j = await r.json().catch(() => ({}));
  if (!r.ok && !j.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

export const SKILLS = [
  {
    id: "gdbx-sync",
    name: "GDBx Sync",
    description: "Read sovereign CRDT state for any .GDBx address.",
    tags: ["gdbx", "sync", "crdt"],
    examples: ["read domain claims for addr …"],
  },
  {
    id: "gdbx-names",
    name: "GDBx Names",
    description: "Resolve and list verified .gdbx short names.",
    tags: ["gdbx", "names", "tld"],
    examples: ["resolve absup.gdbx"],
  },
  {
    id: "gdmx-pay",
    name: "GDMx Pay",
    description: "Create card→USDC checkout (fastest on-ramp wins, 0% fee, non-custodial).",
    tags: ["gdmx", "pay", "checkout"],
    examples: ["5 USD checkout to 0x…"],
  },
  {
    id: "dsgx-support",
    name: "DSGx Support",
    description: "Fetch a developer support profile (dsgx.pages.dev/<login>).",
    tags: ["dsgx", "support", "donate"],
    examples: ["profile for ABsUP"],
  },
];

export const EXECUTORS = {
  async "gdbx-sync"(params = {}) {
    const q = params.prefix ? `?prefix=${encodeURIComponent(params.prefix)}` : "";
    return getJSON(`${WORKER}/sync/${encodeURIComponent(params.addr || "")}${q}`);
  },
  async "gdbx-names"(params = {}) {
    if (params.name) return getJSON(`${WORKER}/name/${encodeURIComponent(String(params.name).toLowerCase())}`);
    return getJSON(`${WORKER}/names`);
  },
  async "gdmx-pay"(params = {}) {
    const p = new URLSearchParams({ to: params.to || "", amount: String(params.amount || 5) });
    if (params.provider) p.set("provider", params.provider);
    if (params.chainId) p.set("chainId", String(params.chainId));
    return getJSON(`${WORKER}/gdmx/create-checkout?${p}`);
  },
  async "dsgx-support"(params = {}) {
    return getJSON(`${WORKER}/dsgx/route/${encodeURIComponent(String(params.login || "").toLowerCase())}`);
  },
};
