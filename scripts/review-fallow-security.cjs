/**
 * Changed-line security candidate gate for review:fallow:security.
 */
const { runFallow } = require("./lib/run-fallow-cli.cjs");

const result = runFallow(
  ["security", "--changed-since", "main", "--gate", "new", "--fail-on-issues"],
  { stdio: "inherit" },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(2);
}

if (result.status === 2) {
  process.exit(2);
}

if (result.status === 1 || result.status === 8) {
  console.error(
    "\nFallow security gate failed: new security candidate(s) on changed lines. Verify each finding; fix or add a narrow suppression with reason.",
  );
  process.exit(1);
}

process.exit(result.status ?? 0);
