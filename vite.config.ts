import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";

// A build stamp (short commit + date) so the running app can show which build
// it is — making stale caches obvious at a glance.
const commit = (() => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "dev";
  }
})();
const build = `${commit} · ${new Date().toISOString().slice(0, 10)}`;

// One codebase, two editions. `--mode eo` builds the Eastern Orthodox edition:
// tradition locked to Eastern Orthodox and the EO-exclusive features enabled.
// The default build is the general app, unchanged.
export default defineConfig(({ mode }) => ({
  // Relative paths so the built app also works when opened directly (file://).
  base: "./",
  plugins: [react()],
  define: {
    __BUILD__: JSON.stringify(build),
    __FLAVOR__: JSON.stringify(
      mode === "eo" ? "eo" : mode === "priest" ? "priest" : "general",
    ),
  },
  server: { port: 5173 },
}));
