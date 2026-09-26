import { execFileSync } from "node:child_process";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
process.chdir(fileURLToPath(new URL("..", import.meta.url)));
const build = () =>
  execFileSync(process.execPath, ["scripts/build.mjs"], { stdio: "inherit" });
build();
await import("./serve.mjs");
let timer;
for (const path of ["src", "public"])
  watch(path, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        build();
      } catch {
        console.error("Build failed. Fix source and save again.");
      }
    }, 150);
  });
