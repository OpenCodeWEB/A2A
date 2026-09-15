import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { agentCard, handleMessage } from "../src/server.js";
import { SKILLS, EXECUTORS } from "../src/skills.js";

describe("agent card", () => {
  it("has 4 skills", () => {
    const card = agentCard();
    assert.equal(card.name, "opencodeweb");
    assert.equal(card.skills.length, 4);
    assert.ok(card.skills.every((s) => s.id && s.name && s.description));
  });
  it("every skill has an executor", () => {
    for (const s of SKILLS) assert.equal(typeof EXECUTORS[s.id], "function", s.id);
  });
});

describe("live skills", () => {
  it("gdbx-names resolves absup", async () => {
    const t = await handleMessage({ skillId: "gdbx-names", params: { name: "absup" } });
    assert.equal(t.status, "completed");
    assert.equal(t.artifact.name, "absup");
  });
  it("gdbx-names lists registry", async () => {
    const t = await handleMessage({ skillId: "gdbx-names", params: {} });
    assert.equal(t.status, "completed");
    assert.ok(t.artifact.count >= 1);
  });
  it("gdmx-pay creates mock checkout", async () => {
    const t = await handleMessage({ skillId: "gdmx-pay", params: { to: "0x123", amount: 5 } });
    assert.equal(t.status, "completed");
    assert.ok(t.artifact.url);
  });
  it("dsgx-support ABsUP", async () => {
    const t = await handleMessage({ skillId: "dsgx-support", params: { login: "ABsUP" } });
    assert.equal(t.status, "completed");
    assert.equal(t.artifact.route.login, "ABsUP");
  });
  it("unknown skill fails gracefully", async () => {
    const t = await handleMessage({ skillId: "nope", params: {} });
    assert.equal(t.status, "failed");
  });
});
