/**
 * Lets `node` run the app's .ts modules directly when they use bundler-style
 * extensionless relative imports (e.g. `import "./engine"`). Used only by the
 * dev test scripts, via:  node --import ./scripts/ts-resolve.mjs <test>.mjs
 */
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith(".") &&
      !/\.(ts|js|mjs|json)$/.test(specifier) &&
      context.parentURL
    ) {
      const candidate = new URL(specifier + ".ts", context.parentURL);
      if (existsSync(fileURLToPath(candidate))) {
        return { url: candidate.href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
});
