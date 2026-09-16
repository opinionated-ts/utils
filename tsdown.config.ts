import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/errors", "src/results"],
  dts: true,
  exports: true,
  outDir: "dist",
  target: false,
});
