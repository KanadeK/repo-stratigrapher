import { execFileSync } from "node:child_process";

const commands = [
  npmArgs(["run", "lint"]),
  npmArgs(["run", "format"]),
  npmArgs(["run", "typecheck"]),
  npmArgs(["run", "test:coverage"]),
  npmArgs(["run", "test:e2e"]),
  npmArgs(["run", "build"]),
];

for (const [command, args] of commands) {
  execFileSync(command, args, { stdio: "inherit" });
}

function npmArgs(args) {
  return process.platform === "win32"
    ? ["cmd.exe", ["/c", "npm", ...args]]
    : ["npm", args];
}
