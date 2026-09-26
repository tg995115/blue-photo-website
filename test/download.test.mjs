import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { createHash } from "node:crypto";
import { detectPlatform, stores, site } from "../src/site.mjs";

test("legal documents retain the published text separately for each language", async () => {
  const manifest = JSON.parse(
    await readFile(new URL("../legal-sources.json", import.meta.url), "utf8"),
  );
  const entities = { amp: "&", quot: '"', lt: "<", gt: ">", nbsp: " " };
  const decode = (value) =>
    value.replace(/&(#x[\da-f]+|#\d+|amp|quot|lt|gt|nbsp);/gi, (_, key) =>
      key.startsWith("#x")
        ? String.fromCodePoint(parseInt(key.slice(2), 16))
        : key.startsWith("#")
          ? String.fromCodePoint(Number(key.slice(1)))
          : entities[key],
    );
  for (const doc of manifest.documents) {
    const kind = doc.file.includes("privacy") ? "privacy" : "terms";
    const base = doc.language === "en" ? "en/" : "";
    const html = await readFile(
      new URL(`../dist/${base}${kind}/index.html`, import.meta.url),
      "utf8",
    );
    const body = html.match(
      /<article[^>]*data-legal-content[^>]*>([\s\S]*?)<\/article>/,
    )?.[1];
    assert.ok(body);
    const text = decode(body.replace(/<[^>]*>/g, "")).replace(/\s+/g, "");
    assert.equal(
      createHash("sha256").update(text).digest("hex"),
      doc.publishedTextSha256,
    );
    assert.equal(text.length, doc.normalizedCharacters);
    for (const [, href] of body.matchAll(/href="([^"]+)"/g)) {
      assert.match(href, /^https:\/\/suwon\.bluewings\.photo\/?$/);
    }
    const file = doc.file.replace("public/", "");
    const raw = await readFile(new URL(`../dist/${file}`, import.meta.url));
    assert.equal(
      createHash("sha256").update(raw).digest("hex"),
      doc.fileSha256,
    );
    assert.ok(html.includes(`href="/${file}"`));
    assert.ok(
      html.includes(`href="/${base}privacy/"`) &&
        html.includes(`href="/${base}terms/"`),
    );
    assert.ok(!html.includes("<script"));
  }
});

test("routes supported devices and leaves unsupported devices a choice", () => {
  for (const [userAgent, expected] of [
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", "ios"],
    ["Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)", "ios"],
    ["Mozilla/5.0 (Linux; Android 16; Pixel 10)", "android"],
    ["Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "windows"],
    ["Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0)", null],
    ["Mozilla/5.0 (X11; Linux x86_64)", null],
    ["Mozilla/5.0 (iPhone) Twitterbot/1.0", null],
    ["", null],
  ])
    assert.equal(detectPlatform({ userAgent }), expected);
  assert.equal(
    detectPlatform({
      userAgent: "Mozilla/5.0 (Macintosh)",
      platform: "MacIntel",
      maxTouchPoints: 5,
    }),
    "ios",
  );
});

test("download script only navigates to the fixed stores, with manual preview and bot fallbacks", async () => {
  const script = await readFile(
    new URL("../dist/assets/download.js", import.meta.url),
    "utf8",
  );
  const run = ({
    requested = "auto",
    userAgent = "",
    platform = "",
    maxTouchPoints = 0,
    search = "",
    lang = "ko",
  } = {}) => {
    const destinations = [];
    const status = {};
    const document = {
      documentElement: { lang },
      querySelector: (selector) =>
        selector === "[data-download-platform]"
          ? { dataset: { downloadPlatform: requested } }
          : status,
    };
    runInNewContext(script, {
      document,
      navigator: { userAgent, platform, maxTouchPoints },
      URLSearchParams,
      window: {
        location: { search, replace: (url) => destinations.push(url) },
      },
    });
    return destinations;
  };
  assert.deepEqual(
    run({
      userAgent: "Android 16",
      search: "?url=https://example.invalid&platform=windows",
    }),
    [stores.android.url],
  );
  assert.deepEqual(
    run({
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
    }),
    [stores.ios.url],
  );
  assert.deepEqual(
    run({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", lang: "en" }),
    [stores.windows.url],
  );
  assert.deepEqual(
    run({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)",
      platform: "MacIntel",
      maxTouchPoints: 5,
    }),
    [stores.ios.url],
  );
  assert.deepEqual(
    run({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)",
      platform: "MacIntel",
      maxTouchPoints: 0,
    }),
    [],
  );
  assert.deepEqual(
    run({ requested: "windows", userAgent: "Mozilla/5.0 (iPhone)" }),
    [stores.windows.url],
  );
  for (const platform of Object.keys(stores))
    assert.deepEqual(run({ requested: platform }), [stores[platform].url]);
  assert.deepEqual(run({ requested: "https://example.invalid" }), []);
  assert.deepEqual(run({ requested: "__proto__" }), []);
  assert.deepEqual(run({ requested: "ios", search: "?preview=1" }), []);
  assert.deepEqual(
    run({ requested: "ios", userAgent: "facebookexternalhit/1.1" }),
    [],
  );
  assert.deepEqual(run({ requested: "ios", userAgent: "Googlebot" }), []);
  assert.deepEqual(run(), []);
  // Exercise the attributes in the actual Korean/English HTML, not just a mocked route.
  for (const locale of ["", "en/"]) {
    const automaticPage = await readFile(
      new URL(`../dist/${locale}download/index.html`, import.meta.url),
      "utf8",
    );
    const automatic = automaticPage.match(
      /data-download-platform="([^"]+)"/,
    )?.[1];
    assert.equal(automatic, "auto");
    for (const fixture of [
      {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
        expected: stores.ios.url,
      },
      {
        userAgent: "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)",
        expected: stores.ios.url,
      },
      {
        userAgent: "Mozilla/5.0 (Linux; Android 16; Pixel 10)",
        expected: stores.android.url,
      },
      {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        expected: stores.windows.url,
      },
      {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)",
        platform: "MacIntel",
        maxTouchPoints: 5,
        expected: stores.ios.url,
      },
      {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)",
        platform: "MacIntel",
        expected: null,
      },
      { userAgent: "Mozilla/5.0 (X11; Linux x86_64)", expected: null },
      { userAgent: "Mozilla/5.0 (iPhone) Twitterbot/1.0", expected: null },
    ]) {
      assert.deepEqual(
        run({ requested: automatic, lang: locale ? "en" : "ko", ...fixture }),
        fixture.expected ? [fixture.expected] : [],
      );
    }
    for (const key of Object.keys(stores)) {
      const page = await readFile(
        new URL(`../dist/${locale}download/${key}/index.html`, import.meta.url),
        "utf8",
      );
      const requested = page.match(/data-download-platform="([^"]+)"/)?.[1];
      assert.equal(requested, key);
      assert.deepEqual(run({ requested }), [stores[key].url]);
    }
  }
});

test("every public route has pre-rendered content and sharing metadata", async () => {
  const paths = [
    "index.html",
    "index/index.html",
    "download/index.html",
    ...Object.keys(stores).map((p) => `download/${p}/index.html`),
  ];
  for (const lang of ["", "en/"])
    for (const path of paths) {
      const html = await readFile(
        new URL(`../dist/${lang}${path}`, import.meta.url),
        "utf8",
      );
      assert.match(html, /<h1[^>]*>/);
      assert.match(html, /<meta property="og:title"/);
      assert.match(
        html,
        /<meta property="og:image" content="https:\/\/bluewings.photo\/assets\/app-icon.png"/,
      );
      assert.match(html, /name="twitter:card"/);
      for (const [key, store] of Object.entries(stores)) {
        assert.ok(
          html.includes(
            path.includes("download")
              ? store.url.replaceAll("&", "&amp;")
              : `/download/${key}/`,
          ),
        );
      }
      assert.ok(!html.includes("go.sqd.link"));
      assert.ok(!html.includes('http-equiv="refresh"'));
      if (!path.includes("download")) {
        assert.ok(html.includes("/assets/hero.js"));
        assert.ok(!html.includes("/assets/download.js"));
        assert.equal((html.match(/data-hero-device="true"/g) || []).length, 2);
      }
      assert.ok(html.includes("/assets/badges/app-store-"));
      assert.ok(html.includes("/assets/badges/google-play-"));
      assert.ok(html.includes("/assets/badges/microsoft-store-"));
    }
  assert.equal(site.origin, "https://bluewings.photo");
});

test("AdMob sees the exact plain-text account record at the root", async () => {
  assert.equal(
    await readFile(new URL("../dist/app-ads.txt", import.meta.url), "utf8"),
    "google.com, pub-7296211612708199, DIRECT, f08c47fec0942fa0\n",
  );
  await assert.rejects(readFile(new URL("../dist/CNAME", import.meta.url)), {
    code: "ENOENT",
  });
  assert.ok(
    (
      await readFile(new URL("../dist/404.html", import.meta.url), "utf8")
    ).includes('name="robots" content="noindex"'),
  );
});
