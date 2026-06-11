/**
 * Publishes the SJOTL edition (built with --mode sjotl) to the
 * sjotl-prayer-app repo's gh-pages branch, served at
 * https://danknowsaguy-web.github.io/sjotl-prayer-app/.
 *
 * Usage:  npm run deploy:priest   (runs the priest build first, then this)
 *
 * The repo must exist on GitHub first. It derives the remote from the existing
 * `origin` remote (which carries your token), so no secrets live in this file.
 */
import { execSync } from "node:child_process";
import { existsSync, writeFileSync, rmSync } from "node:fs";

if (!existsSync("dist/index.html")) {
  console.error("No dist/ build found. Run `npm run build:sjotl` first.");
  process.exit(1);
}

const origin = execSync("git remote get-url origin").toString().trim();
const remote = origin.replace(/prayer-app(\.git)?$/, "sjotl-prayer-app$1");
if (remote === origin) {
  console.error("Could not derive the sjotl-prayer-app remote from origin.");
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
  'git -c user.email=deploy@local -c user.name=deploy commit -q -m "Deploy SJOTL edition"',
  inDist,
);
execSync(`git push -f "${remote}" gh-pages`, inDist);
rmSync("dist/.git", { recursive: true, force: true });

console.log(
  "\nDeployed. Live at https://danknowsaguy-web.github.io/sjotl-prayer-app/",
);
