import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative paths so the built app also works when opened directly (file://).
  base: "./",
  plugins: [react()],
  server: { port: 5173 },
});
