import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  androidIntent,
  appLink,
  kakaoOpenExternal,
  pageLanguage,
  parseMemoryId,
  planOpen,
} from "../src/open-link.mjs";
import { stores } from "../src/site.mjs";

const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36";
const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15 Version/27.0 Mobile/15E148 Safari/604.1";
const IPHONE_KAKAO = `${IPHONE_SAFARI} KAKAOTALK 11.0.0`;
const ANDROID_KAKAO = `${ANDROID_CHROME} KAKAOTALK/11.0.0`;
const DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36";

test("only a well-formed Memory card id is accepted from the address", () => {
  assert.equal(parseMemoryId("?m=memory_1110_2019"), "memory_1110_2019");
  assert.equal(parseMemoryId("?m=memory_0229_2024&utm=x"), "memory_0229_2024");
  for (const bad of ["", "?m=", "?m=memory_1302_2019", "?m=memory_1100_2019", "?m=memory_1110_19",
    "?m=MEMORY_1110_2019", "?m=memory_1110_2019%00", "?m=https://evil.example", "?m=memory_1110_2019/../x",
    "?m=memory_1110_2019&m=other", "?x=memory_1110_2019"]) {
    // A repeated parameter resolves to its first value, which is validated like any other.
    if (bad === "?m=memory_1110_2019&m=other") assert.equal(parseMemoryId(bad), "memory_1110_2019");
    else assert.equal(parseMemoryId(bad), null, bad);
  }
});

test("app links and intents carry only the validated id and the fixed store destination", () => {
  assert.equal(appLink("memory_1110_2019"), "bluephoto://app/collections/memory/memory_1110_2019");
  const intent = androidIntent("memory_1110_2019");
  assert.ok(intent.startsWith("intent://app/collections/memory/memory_1110_2019#Intent;scheme=bluephoto;package=photo.bluewings.suwon;"));
  assert.ok(intent.endsWith(`S.browser_fallback_url=${encodeURIComponent(stores.android.url)};end`));
  assert.equal(kakaoOpenExternal("https://app.bluewings.photo/open/?m=memory_1110_2019"),
    "kakaotalk://web/openExternal?url=https%3A%2F%2Fapp.bluewings.photo%2Fopen%2F%3Fm%3Dmemory_1110_2019");
});

test("arrival plan: Android opens the intent, iOS tries the scheme then the App Store, KakaoTalk escapes first", () => {
  const id = "memory_1110_2019";
  assert.deepEqual(planOpen({ id, userAgent: ANDROID_CHROME }), { action: "android-intent" });
  assert.deepEqual(planOpen({ id, userAgent: ANDROID_KAKAO }), { action: "android-intent" });
  assert.deepEqual(planOpen({ id, userAgent: IPHONE_SAFARI }), { action: "ios-scheme", fallback: stores.ios.url });
  assert.deepEqual(planOpen({ id, userAgent: IPHONE_KAKAO }), { action: "kakao-external" });
  assert.deepEqual(planOpen({ id, userAgent: "Mozilla/5.0 (Macintosh)", platform: "MacIntel", maxTouchPoints: 5 }),
    { action: "ios-scheme", fallback: stores.ios.url }, "iPadOS reports itself as a Mac with touch");
});

test("crawlers, desktop browsers and malformed links never navigate on their own", () => {
  const id = "memory_1110_2019";
  assert.deepEqual(planOpen({ id, userAgent: DESKTOP }), { action: "none" });
  assert.deepEqual(planOpen({ id, userAgent: "kakaotalk-scrap/1.0 bot" }), { action: "none" });
  assert.deepEqual(planOpen({ id, userAgent: "facebookexternalhit/1.1" }), { action: "none" });
  assert.deepEqual(planOpen({ id: null, userAgent: ANDROID_CHROME }), { action: "none" });
  assert.deepEqual(planOpen({ id: null, userAgent: IPHONE_SAFARI }), { action: "none" });
});

test("the built page is static, bilingual, not indexed and keeps both buttons", async () => {
  const html = await readFile(new URL("../dist/open/index.html", import.meta.url), "utf8");
  assert.match(html, /name="robots" content="noindex"/);
  assert.match(html, /data-open-app/);
  assert.match(html, /data-store/);
  assert.match(html, /src="\/assets\/open\.js"/);
  assert.match(html, /data-ko="앱에서 열기" data-en="Open in app"/);
  const script = await readFile(new URL("../dist/assets/open.js", import.meta.url), "utf8");
  assert.ok(script.length > 200);
  assert.ok(!/gtag|dataLayer/.test(script), "the open script itself sends no events");
});

test("the shared link's preview is small: a short title and description, no image", async () => {
  for (const path of ["open", "en/open"]) {
    const html = await readFile(new URL(`../dist/${path}/index.html`, import.meta.url), "utf8");
    assert.ok(!/og:image|twitter:image/.test(html), path);
    const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1];
    const description = html.match(/<meta property="og:description" content="([^"]*)"/)?.[1];
    assert.ok(title && title.length < 30, `${path}: ${title}`);
    assert.ok(description && description.length < 80, `${path}: ${description}`);
  }
  const ko = await readFile(new URL("../dist/open/index.html", import.meta.url), "utf8");
  assert.match(ko, /og:title" content="Blue Photo 앱으로 이동"/);
  assert.match(ko, /og:description" content="앱이 있으면 바로 열리고, 없으면 스토어로 이동합니다\."/);
  assert.ok(!/<header|<footer|skip-link/.test(ko), "a redirect page has no site navigation");
});

test("the page tells a visitor whose older app opened without the card to update", async () => {
  for (const [path, phrase] of [["open", "최신 버전으로 업데이트"], ["en/open", "Update Blue Photo to the latest version"]]) {
    const html = await readFile(new URL(`../dist/${path}/index.html`, import.meta.url), "utf8");
    assert.ok(html.includes(phrase), path);
    assert.match(html, /data-store/, "the store button stays, labelled for both getting and updating");
  }
});

test("the English route is always English and the shared link follows the browser language", () => {
  assert.equal(pageLanguage({ pathname: "/en/open/", language: "ko-KR" }), "en");
  assert.equal(pageLanguage({ pathname: "/en/open", language: "" }), "en");
  assert.equal(pageLanguage({ pathname: "/open/", language: "ko-KR" }), "ko");
  assert.equal(pageLanguage({ pathname: "/open/", language: "en-US" }), "en");
  assert.equal(pageLanguage({ pathname: "/open/", language: "" }), "ko");
  assert.equal(pageLanguage({ pathname: "/english/open/", language: "ko" }), "ko", "only the /en/ prefix counts");
});

