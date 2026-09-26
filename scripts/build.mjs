import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { createBuildConfig } from "../src/build-config.mjs";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));
const { values } = parseArgs({
  options: {
    "site-url": { type: "string" },
    "out-dir": { type: "string", default: "dist" },
    "custom-domain": { type: "string", default: "" },
  },
});
const profile = createBuildConfig({
  siteUrl: values["site-url"],
  outputDir: values["out-dir"],
  customDomain: values["custom-domain"],
});
const outDir = profile.outputDir;
await rm(outDir, { recursive: true, force: true });
await mkdir(`${outDir}/assets`, { recursive: true });
await mkdir(".build", { recursive: true });
await cp("public", outDir, { recursive: true });
await cp("src/site.css", `${outDir}/assets/site.css`);
await cp("THIRD-PARTY-LICENSE.txt", `${outDir}/THIRD-PARTY-LICENSE.txt`);
await mkdir(`${outDir}/licenses/paper-shaders`, { recursive: true });
await cp(
  "node_modules/@paper-design/shaders-react/LICENSE",
  `${outDir}/licenses/paper-shaders/LICENSE.txt`,
);
await cp(
  "node_modules/@paper-design/shaders-react/NOTICE",
  `${outDir}/licenses/paper-shaders/NOTICE.txt`,
);
const renderer = `.build/render-${outDir}.mjs`;
await build({
  entryPoints: ["src/render.jsx"],
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  outfile: renderer,
  jsx: "automatic",
});
execFileSync(process.execPath, [renderer], {
  stdio: "inherit",
  env: {
    ...process.env,
    BLUE_PHOTO_SITE_URL: profile.siteUrl,
    BLUE_PHOTO_OUTPUT_DIR: outDir,
    BLUE_PHOTO_CUSTOM_DOMAIN: profile.customDomain,
  },
});
await build({
  entryPoints: { hero: "src/hero.mjs" },
  bundle: true,
  splitting: true,
  platform: "browser",
  format: "esm",
  minify: true,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  target: "es2022",
  outdir: `${outDir}/assets`,
  chunkNames: "chunks/[name]-[hash]",
});
await build({
  entryPoints: ["src/download.mjs"],
  bundle: true,
  platform: "browser",
  format: "esm",
  minify: true,
  target: "es2022",
  outfile: `${outDir}/assets/download.js`,
});
console.log(
  `Static output: ${outDir}; public URL: ${profile.siteUrl}; custom domain: ${profile.customDomain || "none"}`,
);
