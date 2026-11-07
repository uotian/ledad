// @vitest-environment node
import { execSync } from "node:child_process";
import merge from "deepmerge";
import { describe, expect, it } from "vitest";

describe("deepmerge upstream workaround", () => {
  it("preserves ordinary configuration merges", () => {
    expect(merge({ theme: { color: "blue", fonts: ["sans"] } }, { theme: { spacing: 4, fonts: ["serif"] } }))
      .toEqual({ theme: { color: "blue", spacing: 4, fonts: ["sans", "serif"] } });
  });

  it("rejects prototype poisoning in the actual shadcn command", () => {
    const probe = new URL("./security-probe.mjs", import.meta.url);
    const output = execSync("npm run shadcn -- --version", {
      cwd: new URL("../../", import.meta.url),
      encoding: "utf8",
      env: {
        ...process.env,
        NODE_OPTIONS: [process.env.NODE_OPTIONS, `--import=${probe.href}`].filter(Boolean).join(" "),
      },
      timeout: 15_000,
    });
    expect(output).toContain("deepmerge prototype-poisoning inputs rejected");
  });
});
