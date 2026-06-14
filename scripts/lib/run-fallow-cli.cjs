/**
 * Shared npx fallow spawn helper for review:* gate scripts.
 */
const { spawnSync } = require("node:child_process");
const { rootDir } = require("./repo-root.cjs");

function runFallow(fallowArgs, spawnOptions = {}) {
  return spawnSync("npx", ["-y", "fallow", ...fallowArgs], {
    cwd: rootDir,
    shell: true,
    ...spawnOptions,
  });
}

module.exports = { runFallow };
