# A2A — OpenCodeWEB Agent-to-Agent Protocol

> **Agent-to-Agent** (Google A2A JSON-RPC 2.0) for the sovereign ecosystem — any agent can delegate `sync`, `names`, `pay`, `support` tasks to the `opencodeweb` agent. **Free, MIT, 0% fee.**

**Repo:** `github.com/OpenCodeWEB/A2A` · **Live mesh:** `https://gdbx.xup.workers.dev`

## 4 Skills

| Skill | Description |
|---|---|
| `gdbx-sync` | Read sovereign CRDT state (`addr`, `prefix`) |
| `gdbx-names` | Resolve/list verified `.gdbx` names |
| `gdmx-pay` | Card→USDC checkout (`to`, `amount`, `provider`, `chainId`) |
| `dsgx-support` | Developer support profile (`login`) |

## Usage

```bash
npm test          # 7 tests (card + live skills)
npm start         # :8788 — /.well-known/agent.json
```

**AgentCard:** `GET /.well-known/agent.json`
**JSON-RPC:** `POST /` — `message/send`, `message/stream` (SSE), `tasks/get`, `tasks/cancel`

```bash
curl localhost:8788/.well-known/agent.json
curl -X POST localhost:8788/ -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","method":"message/send","params":{"skillId":"gdbx-names","params":{"name":"absup"}},"id":1}'
```

## Principles

- **Non-custodial** — tasks read open mesh, writes stay signed client-side
- **0% fee** — only gas
- **MIT** — fork, self-host, no vendor lock
