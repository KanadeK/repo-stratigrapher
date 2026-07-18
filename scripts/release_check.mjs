import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const gitEnv = {
  ...process.env,
  GIT_CONFIG_COUNT: "1",
  GIT_CONFIG_KEY_0: "safe.directory",
  GIT_CONFIG_VALUE_0: path.resolve("."),
};

const required = [
  "dist/index.html",
  "dist-release/repo-stratigrapher-v0.1.0-static.zip",
  "dist-release/SHA256SUMS.txt",
];
for (const file of required) {
  if (!existsSync(file)) throw new Error(`Missing release artifact: ${file}`);
}

const changelog = readFileSync("CHANGELOG.md", "utf8");
if (!changelog.includes("v0.1.0"))
  throw new Error("CHANGELOG.md must contain v0.1.0");

const status = execFileSync("git", ["status", "--short"], {
  encoding: "utf8",
  env: gitEnv,
}).trim();
if (status) throw new Error(`Working tree is not clean:\n${status}`);

const author = execFileSync("git", ["log", "--format=%an <%ae> | %cn <%ce>"], {
  encoding: "utf8",
  env: gitEnv,
});
if (!author.includes("KanadeK <121669563+KanadeK@users.noreply.github.com>")) {
  throw new Error("Expected KanadeK noreply identity in git history.");
}

let suspicious = "";
const forbiddenPattern = [
  "TO" + "DO",
  "FIX" + "ME",
  "Not" + "Implemented",
  "place" + "holder",
  "coming" + " soon",
  "lorem" + " ipsum",
].join("|");
try {
  suspicious = execFileSync("git", ["grep", "-nE", forbiddenPattern], {
    encoding: "utf8",
    env: gitEnv,
  }).trim();
} catch (error) {
  if (error.status !== 1) throw error;
}
if (suspicious) throw new Error(`Found forbidden marker text:\n${suspicious}`);

console.log("Release check passed.");
