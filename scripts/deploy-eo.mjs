/**
 * Publishes the Eastern Orthodox edition (dist/, built with --mode eo) to the
 * eo-prayer-app repo's gh-pages branch, served at
 * https://danknowsaguy-web.github.io/eo-prayer-app/.
 *
 * Usage:  npm run deploy:eo   (runs the EO build first, then this)
 *
 * It derives the EO repo URL from the existing `origin` remote (which carries
 * your token), so no secrets live in this file.
 */
import { execSync } from "node:child_process";
import { existsSync, writeFileSync, rmSync } from "node:fs";

if (!existsSync("dist/index.html")) {
  console.error("No dist/ build found. Run `npm run build:eo` first.");
  process.exit(1);
}

const origin = execSync("git remote get-url origin").toString().trim();
const eoRemote = origin.replace(/prayer-app(\.git)?$/, "eo-prayer-app$1");
if (eoRemote === origin) {
  console.error("Could not derive the eo-prayer-app remote from origin.");
  process.exit(1);
}

// GitHub Pages: skip Jekyll processing of the static output.
writeFileSync("dist/.nojekyll", "");

// Fresh throwaway history in dist/, force-pushed to gh-pages.
rmSync("dist/.git", { recursive: true, force: true });
const inDist = { cwd: "dist", stdio: "inherit" };
execSync("git init -q", inDist);
execSync("git checkout -q -b gh-pages", inDist);
execSync("git add -A", inDist);
execSync(
  'git -c user.email=deploy@local -c user.name=deploy commit -q -m "Deploy EO edition"',
  inDist,
);
execSync(`git push -f "${eoRemote}" gh-pages`, inDist);
rmSync("dist/.git", { recursive: true, force: true });

console.log(
  "\nDeployed. Live at https://danknowsaguy-web.github.io/eo-prayer-app/",
);
