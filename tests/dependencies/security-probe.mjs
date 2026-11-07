import assert from "node:assert/strict";
import { createRequire } from "node:module";
import merge from "deepmerge";

// Preloaded by the test: verify the CLI child, not its npm parent process.
if (process.argv[1] === createRequire(import.meta.url).resolve("shadcn")) {
  const payload = JSON.parse('{"__proto__":{"injected":true}}');
  for (const [target, source] of [
    [Object.create(null), payload],
    [{ session: null }, { session: payload }],
    [{ session: undefined }, { session: payload }],
    [payload, {}],
  ]) {
    assert.throws(() => merge(target, source), { code: "ERR_PROTO_ACCESS" });
  }
  assert.equal(Object.prototype.hasOwnProperty.call(Object.prototype, "injected"), false);
  console.log("deepmerge prototype-poisoning inputs rejected");
}
