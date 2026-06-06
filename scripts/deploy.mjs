/**
 * Publishes the built site (dist/) to the gh-pages branch, which GitHub Pages
 * serves at https://danknowsaguy-web.github.io/prayer-app/.
 *
 * Usage:  npm run deploy   (runs the build first, then this)
 *
 * It reuses the existing `origin` remote URL (which carries your token), so no
 * secrets live in this file. Edit the app, then run `npm run deploy`.
 */
import { execSync } from "node:child_process";
import { existsSync, writeFileSync, rmSync } from "node:fs";

if (!existsSync("dist/index.html")) {
  console.error("No dist/ build found. Run `npm run build` first.");
  process.exit(1);
}

const origin = execSync("git remote get-url origin").toString().trim();

// GitHub Pages: skip Jekyll processing of the static output.
writeFileSync("dist/.nojekyll", "");

// Fresh throwaway history in dist/, force-pushed to gh-pages.
rmSync("dist/.git", { recursive: true, force: true });
const inDist = { cwd: "dist", stdio: "inherit" };
execSync("git init -q", inDist);
execSync("git checkout -q -b gh-pages", inDist);
execSync("git add -A", inDist);
execSync(
  'git -c user.email=deploy@local -c user.name=deploy commit -q -m "Deploy site"',
  inDist,
);
execSync(`git push -f "${origin}" gh-pages`, inDist);
rmSync("dist/.git", { recursive: true, force: true });

console.log("\nDeployed. Live at https://danknowsaguy-web.github.io/prayer-app/");
