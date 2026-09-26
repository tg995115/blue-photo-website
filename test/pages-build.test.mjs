import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createBuildConfig } from "../src/build-config.mjs";

const root = fileURLToPath(new URL("../dist-pages/", import.meta.url));
const publicUrl = "https://dusskapark.github.io/blue-photo-website/";
const base = "/blue-photo-website/";

test("build profiles support the repository path without enabling a custom domain", () => {
  const profile = createBuildConfig({
    siteUrl: publicUrl,
    outputDir: "dist-pages",
  });
  assert.equal(profile.pathFor("/en/privacy/"), "/blue-photo-website/en/privacy/");
  assert.equal(
    profile.absoluteUrl("/assets/app-icon.png"),
    publicUrl + "assets/app-icon.png",
  );
  assert.equal(profile.customDomain, "");
  assert.throws(() => createBuildConfig({ outputDir: "src" }));
  assert.throws(() =>
    createBuildConfig({ siteUrl: publicUrl, customDomain: "bluewings.photo" }),
  );
  assert.throws(() =>
    createBuildConfig({ siteUrl: "https://example.com/?token=value" }),
  );
  assert.equal(
    createBuildConfig({
      siteUrl: "https://bluewings.photo/",
      customDomain: "bluewings.photo",
    }).pathFor("/privacy/"),
    "/privacy/",
  );
});

test("every Pages page has working prefixed links, assets and metadata", async () => {
  const pages = (await readdir(root, { recursive: true })).filter((name) =>
    name.endsWith(".html"),
  );
  assert.equal(pages.length, 17);
  for (const name of pages) {
    const html = await readFile(join(root, name), "utf8");
    assert.ok(html.includes(`<link rel="canonical" href="${publicUrl}`), name);
    assert.ok(
      html.includes(`<meta property="og:url" content="${publicUrl}`),
      name,
    );
    assert.ok(
      html.includes(
        `<meta property="og:image" content="${publicUrl}assets/app-icon.png"`,
      ),
      name,
    );
    for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      if (value.startsWith("#") || /^https?:\/\//.test(value)) continue;
      assert.ok(value.startsWith(base), `${name}: ${value}`);
      let file = join(root, value.slice(base.length).split(/[?#]/)[0]);
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      await access(file);
    }
    if (name.includes("download")) {
      const routePlatform =
        name.match(/download\/(ios|android|windows)\//)?.[1] || "auto";
      assert.ok(
        html.includes(`data-download-platform="${routePlatform}"`),
        name,
      );
    }
  }
  const entry = await readFile(join(root, "assets/hero.js"), "utf8");
  for (const [, relative] of entry.matchAll(/import\(["']([^"']+)["']\)/g))
    await access(join(root, "assets", relative));
});

test("Pages keeps the tested redirect script, legal files and AdMob record with no CNAME", async () => {
  await assert.rejects(readFile(join(root, "CNAME")), { code: "ENOENT" });
  await access(join(root, ".nojekyll"));
  assert.equal(
    await readFile(join(root, "app-ads.txt"), "utf8"),
    "google.com, pub-7296211612708199, DIRECT, f08c47fec0942fa0\n",
  );
  assert.equal(
    await readFile(join(root, "assets/download.js"), "utf8"),
    await readFile(
      new URL("../dist/assets/download.js", import.meta.url),
      "utf8",
    ),
  );
  for (const name of await readdir(join(root, "legal"))) {
    assert.deepEqual(
      await readFile(join(root, "legal", name)),
      await readFile(new URL(`../public/legal/${name}`, import.meta.url)),
    );
  }
  assert.ok(
    (await readFile(join(root, "robots.txt"), "utf8")).includes(
      `${publicUrl}sitemap.xml`,
    ),
  );
  assert.ok(
    !(await readFile(join(root, "sitemap.xml"), "utf8")).includes(
      "https://bluewings.photo",
    ),
  );
});
