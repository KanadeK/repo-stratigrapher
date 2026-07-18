import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, renameSync } from "node:fs";
import path from "node:path";

const target = path.resolve(process.argv[2] ?? "examples/fixture-repo");
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

run("git", ["init", "-b", "main"], target);
run("git", ["config", "user.name", "Fixture Bot"], target);
run("git", ["config", "user.email", "fixture@example.test"], target);

const authors = [
  ["Ari Maintainer", "ari@example.test"],
  ["Mika Reviewer", "mika@example.test"],
  ["Noor Contributor", "noor@example.test"],
];

for (const dir of [
  "src/payments",
  "src/api",
  "tests",
  "docs",
  ".repo-stratigrapher",
]) {
  mkdirSync(path.join(target, dir), { recursive: true });
}

commit(0, "seed application shell", {
  "src/payments/accounts.ts":
    "export const accounts = new Map<string, number>();\n",
  "src/api/http.ts":
    "export function ok(value: unknown) { return { status: 200, value } }\n",
  "tests/smoke.test.ts": "export const smoke = true;\n",
  "README.md": "# Fixture Repository\n",
});

for (let index = 1; index <= 21; index += 1) {
  const files = {};
  files["src/payments/accounts.ts"] =
    `export const accounts = new Map<string, number>();\nexport const revision${index} = ${index};\n`;
  files["src/payments/reconcile.ts"] =
    `export function reconcile${index}(left: number, right: number) { return left - right + ${index}; }\n`;
  if (index % 2 === 0)
    files["tests/payments.test.ts"] =
      `export const paymentCase${index} = ${index};\n`;
  if (index % 3 === 0)
    files["src/api/http.ts"] =
      `export function ok${index}(value: unknown) { return { status: 200, value, rev: ${index} } }\n`;
  if (index % 5 === 0)
    files[`docs/note-${index}.md`] =
      `# Note ${index}\n\nSynthetic architecture note.\n`;
  commit(index, `evolve payment layer ${index}`, files);
}

renameFile(
  "src/payments/accounts.ts",
  "src/payments/ledger.ts",
  22,
  "rename accounts to ledger",
);
renameFile(
  "src/api/http.ts",
  "src/api/routes.ts",
  23,
  "rename http adapter to routes",
);
renameFile(
  "tests/smoke.test.ts",
  "tests/health.test.ts",
  24,
  "rename smoke test to health test",
);

writeFileSync(
  path.join(target, ".repo-stratigrapher", "failures.json"),
  JSON.stringify(
    [
      failure("src/payments/ledger.ts", "reconciles negative balance", 12),
      failure("src/payments/ledger.ts", "keeps account totals stable", 15),
      failure("src/payments/ledger.ts", "applies settlement idempotently", 19),
      failure("src/payments/reconcile.ts", "rounds settlement deltas", 18),
      failure("src/api/routes.ts", "returns validation errors", 23),
    ],
    null,
    2,
  ),
);
commit(25, "record deterministic failure feed", {});

function commit(index, message, files) {
  for (const [file, contents] of Object.entries(files)) {
    const absolute = path.join(target, file);
    mkdirSync(path.dirname(absolute), { recursive: true });
    writeFileSync(absolute, contents);
  }
  run("git", ["add", "."], target);
  const author = authors[index % authors.length];
  const date = new Date(Date.UTC(2025, 0, index + 1, 10, 0, 0)).toISOString();
  run("git", ["commit", "-m", message], target, {
    GIT_AUTHOR_NAME: author[0],
    GIT_AUTHOR_EMAIL: author[1],
    GIT_COMMITTER_NAME: author[0],
    GIT_COMMITTER_EMAIL: author[1],
    GIT_AUTHOR_DATE: date,
    GIT_COMMITTER_DATE: date,
  });
}

function renameFile(from, to, index, message) {
  renameSync(path.join(target, from), path.join(target, to));
  commit(index, message, {});
}

function failure(pathName, testName, day) {
  return {
    path: pathName,
    testName,
    failedAt: new Date(Date.UTC(2025, 0, day, 12, 0, 0)).toISOString(),
    message: "Synthetic failure from fixture test telemetry.",
  };
}

function run(command, args, cwd, env = {}) {
  execFileSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: "ignore",
  });
}
