import { createHash } from "node:crypto";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const version = "v0.1.0";
const out = path.resolve("dist-release");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const zipName = `repo-stratigrapher-${version}-static.zip`;
zipDirectory(zipName);

const sums = [];
for (const file of readdirSync(out)) {
  const absolute = path.join(out, file);
  if (statSync(absolute).isFile())
    sums.push(`${await sha256(absolute)}  ${file}`);
}

function zipDirectory(zipName) {
  const destination = path.join("dist-release", zipName);
  if (process.platform === "win32") {
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        `Compress-Archive -Path dist\\* -DestinationPath ${destination} -Force`,
      ],
      { stdio: "inherit" },
    );
    return;
  }

  if (existsSync("/usr/bin/zip") || existsSync("/bin/zip")) {
    execFileSync("zip", ["-r", path.join("..", destination), "."], {
      cwd: "dist",
      stdio: "inherit",
    });
    return;
  }

  execFileSync("tar", ["-a", "-cf", destination, "-C", "dist", "."], {
    stdio: "inherit",
  });
}
writeFileSync(path.join(out, "SHA256SUMS.txt"), `${sums.join("\n")}\n`);

function sha256(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    createReadStream(file)
      .on("data", (chunk) => hash.update(chunk))
      .on("error", reject)
      .on("end", () => resolve(hash.digest("hex")));
  });
}
