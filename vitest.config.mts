import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": src,
      "server-only": fileURLToPath(new URL("./tests/setup/server-only.ts", import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: ["./tests/setup/vitest.ts"],
    coverage: {
      exclude: [
        "**/*.d.ts",
        "**/types.ts",
      ],
      include: [
        "src/ai/**/*.ts",
        "src/app/api/**/*.ts",
        "src/components/**/*.tsx",
        "src/hooks/**/*.ts",
        "src/lib/**/*.ts",
      ],
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      thresholds: {
        branches: 75,
        functions: 85,
        lines: 90,
        statements: 90,
      },
    },
  },
});
