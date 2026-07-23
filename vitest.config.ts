import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/model/**/*.ts"],
      exclude: ["src/model/**/*.test.ts", "src/model/testFixtures.ts"],
      reporter: ["text", "html"],
    },
  },
});
