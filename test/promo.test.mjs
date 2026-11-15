import test from "node:test";
import assert from "node:assert/strict";
import { mountPromotionPage } from "../src/promo.mjs";
import { parsePromotionCode, planPromotion, promotionAppLink, promotionAndroidIntent,
  promotionInstallURL, promotionDownloadURL } from "../src/promo-link.mjs";
import { slogans } from "../src/slogans.mjs";
import { mountDownloadPage } from "../src/download.mjs";
import { stores } from "../src/site.mjs";

const ios = { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 27_0) Safari/605.1", language: "ko-KR" };
const android = { userAgent: "Mozilla/5.0 (Linux; Android 16) Chrome/140.0 Mobile Safari/537.36" };

function page({ search = "?code=EXAMPLE", navigator = ios, pathname = "/promo/", background, messages = {} } = {}) {
  const events = { document: new Map(), window: new Map() };
  const visits = [], timers = [], backgrounds = [], cleared = [];
  const status = { textContent: "" }, icon = {};
  const input = { value: "", listeners: new Map(), addEventListener: (event, handler) => input.listeners.set(event, handler) };
  const form = { addEventListener: (_, handler) => { form.submit = handler; } };
  const translated = { dataset: { ko: "한국어", en: "English" }, textContent: "" };
  const main = { dataset: { opening: "opening", invalidCode: "invalid", phoneRequired: "phone",
    downloadPath: pathname.startsWith("/en/") ? "/en/download/" : "/download/", ...messages },
    querySelector: selector => selector === "[data-promotion-form]" ? form :
      selector === "[data-promotion-code]" ? input : status };
  const document = { hidden: false, documentElement: {},
    querySelector: selector => selector === "[data-promotion]" ? main : icon,
    querySelectorAll: () => [translated],
    addEventListener: (event, handler) => events.document.set(event, handler) };
  let href = `https://app.bluewings.photo${pathname}${search}`;
  const location = { search, pathname, replace: value => visits.push(value),
    get href() { return href; }, set href(value) { href = value; visits.push(value); } };
  const window = { location, addEventListener: (event, handler) => events.window.set(event, handler),
    clearTimeout: timer => cleared.push(timer),
    setTimeout: (handler, delay) => { timers.push({ handler, delay }); return timers.length; } };
  mountPromotionPage({ document, window, navigator, background: background ?? (args => backgrounds.push(args)) });
  return { events, visits, timers, backgrounds, status, document, translated, icon, window, input, form, cleared };
}

test("only one bounded plain code and an optional preview flag are accepted", () => {
  for (const search of ["?code=A", `?code=${"Z".repeat(64)}`, "?code=Example09&preview=1", "?preview=1&code=Example09"])
    assert.ok(parsePromotionCode(search), search);
  for (const bad of [null, "", "?code=", `?code=${"A".repeat(65)}`, "?code=한글", "?code=A_A", "?code=A-A",
    "?code=A&code=B", "?code=A&preview=0", "?code=A&preview=1&preview=1", "?code=A&next=https://evil.example",
    "?code=%41", "?%63ode=A", "?code=A+B", "?code=A#x", "?code=A&", "?code=A\n"])
    assert.equal(parsePromotionCode(bad), null, String(bad));
});

test("scheme, package-pinned intent and the existing download page preserve the code", () => {
  assert.equal(promotionAppLink("Example09"), "bluephoto://app/premium?code=Example09");
  const apple = new URL(promotionInstallURL("Example09", "ios"));
  assert.equal(apple.origin + apple.pathname, "https://apps.apple.com/redeem");
  assert.deepEqual([...apple.searchParams], [["ctx", "offercodes"], ["id", "6801591787"], ["code", "Example09"]]);
  const download = promotionDownloadURL("Example09", "/download/");
  assert.equal(download, "/download/?code=Example09");
  assert.equal(promotionDownloadURL("Example09", "/project/en/download/", "ios"), "/project/en/download/ios/?code=Example09");
  for (const path of ["https://evil.example/download/", "//evil.example/download/", "/../download/", "/download/?next=evil"])
    assert.equal(promotionDownloadURL("Example09", path), null);
  const intent = promotionAndroidIntent("Example09", `https://app.bluewings.photo${download}`);
  assert.ok(intent.startsWith("intent://app/premium?code=Example09#Intent;scheme=bluephoto;package=photo.bluewings.suwon;"));
  const fallback = new URL(decodeURIComponent(intent.split("S.browser_fallback_url=")[1].split(";end")[0]));
  assert.equal(fallback.origin + fallback.pathname, "https://app.bluewings.photo/download/");
  assert.equal(fallback.searchParams.get("code"), "Example09");
  for (const invalid of [null, undefined, "", "A&next=evil", "A/../B"])
    for (const builder of [promotionAppLink, promotionAndroidIntent, value => promotionInstallURL(value, "ios")])
      assert.equal(builder(invalid), null);
});

test("platform plans reuse existing iPad detection and Kakao external-browser behavior", () => {
  assert.equal(planPromotion({ code: "A", ...android }).action, "android-intent");
  assert.equal(planPromotion({ code: "A", ...ios }).action, "ios-scheme");
  assert.equal(planPromotion({ code: "A", platform: "MacIntel", maxTouchPoints: 5 }).action, "ios-scheme");
  assert.equal(planPromotion({ code: "A", userAgent: `${ios.userAgent} KAKAOTALK` }).action, "kakao-external");
  for (const userAgent of ["Windows NT 10.0", "facebookexternalhit/1.1", "kakaotalk-scrap/1.0 bot"])
    assert.deepEqual(planPromotion({ code: "A", userAgent }), { action: "none" });
});

test("iOS tries the app, then the existing download page only while the page stays visible", () => {
  const context = page();
  assert.deepEqual(context.visits, ["bluephoto://app/premium?code=EXAMPLE"]);
  assert.equal(context.status.textContent, "opening");
  assert.equal(context.timers[0].delay, 1800);
  context.timers[0].handler();
  assert.equal(context.visits[1], "/download/?code=EXAMPLE");
  for (const event of ["visibilitychange", "pagehide", "blur"]) {
    const hidden = page();
    (event === "visibilitychange" ? hidden.events.document : hidden.events.window).get(event)();
    hidden.timers[0].handler();
    assert.equal(hidden.visits.length, 1, event);
  }
  const hidden = page();
  hidden.document.hidden = true;
  hidden.timers[0].handler();
  assert.equal(hidden.visits.length, 1);
});

test("Android uses the intent's download fallback; Kakao hands the same validated page to the browser", () => {
  const play = page({ navigator: android });
  assert.deepEqual(play.visits, [promotionAndroidIntent("EXAMPLE", "https://app.bluewings.photo/download/?code=EXAMPLE")]);
  assert.equal(play.timers.length, 0);
  const kakao = page({ navigator: { ...ios, userAgent: `${ios.userAgent} KAKAOTALK` } });
  assert.equal(kakao.visits[0], "kakaotalk://web/openExternal?url=" + encodeURIComponent("https://app.bluewings.photo/promo/?code=EXAMPLE"));
});

test("preview, malformed links, bots and desktops do not navigate or schedule fallbacks", () => {
  for (const options of [{ search: "?code=A&preview=1" }, { search: "?code=A&next=evil" },
    { search: "" }, { navigator: { userAgent: "Windows NT 10.0" } },
    { navigator: { userAgent: "iPhone bot" } }]) {
    const context = page(options);
    assert.deepEqual(context.visits, []);
    assert.equal(context.timers.length, 0);
  }
  assert.equal(page({ search: "" }).status.textContent, "invalid");
  assert.equal(page({ navigator: { userAgent: "Windows NT" } }).status.textContent, "phone");
});

test("the original background receives its unchanged slogans and icon; decoration failure does not block navigation", () => {
  const context = page({ pathname: "/en/promo/" });
  assert.equal(context.backgrounds[0].slogans, slogans);
  assert.equal(context.backgrounds[0].icon, context.icon);
  assert.equal(context.document.documentElement.lang, "en");
  assert.equal(context.translated.textContent, "English");
  const failure = page({ background: () => { throw new Error("decoration unavailable"); } });
  assert.deepEqual(failure.visits, ["bluephoto://app/premium?code=EXAMPLE"]);
});

test("status language follows the shared link's browser language and the explicit English route", () => {
  const messages = { openingKo: "열기", openingEn: "Open", invalidCodeKo: "잘못됨", invalidCodeEn: "Invalid",
    phoneRequiredKo: "휴대폰", phoneRequiredEn: "Phone" };
  assert.equal(page({ navigator: { ...ios, language: "en-US" }, messages }).status.textContent, "Open");
  assert.equal(page({ pathname: "/en/promo/", messages }).status.textContent, "Open");
  assert.equal(page({ messages }).status.textContent, "열기");
  assert.equal(page({ search: "", pathname: "/en/promo/", messages }).status.textContent, "Invalid");
  assert.equal(page({ navigator: { userAgent: "Windows NT", language: "en" }, messages }).status.textContent, "Phone");
});

test("manual submit validates and opens the current code, replacing the prior timer", () => {
  const context = page();
  assert.equal(context.input.value, "EXAMPLE");
  context.input.value = "SECOND";
  let prevented = false;
  context.form.submit({ preventDefault: () => { prevented = true; } });
  assert.ok(prevented);
  assert.deepEqual(context.visits, ["bluephoto://app/premium?code=EXAMPLE", "bluephoto://app/premium?code=SECOND"]);
  assert.deepEqual(context.cleared, [1]);
  context.timers[0].handler();
  assert.equal(context.visits.length, 2, "a stale timer cannot send the original code");
  context.timers[1].handler();
  assert.equal(context.visits[2], "/download/?code=SECOND");
  context.input.value = "BAD CODE";
  context.form.submit({ preventDefault() {} });
  assert.equal(context.status.textContent, "invalid");
  assert.equal(context.visits.length, 3);
});

test("manual retry after departure resets the fallback and English download route", () => {
  const context = page({ pathname: "/en/promo/" });
  context.events.window.get("blur")();
  context.form.submit({ preventDefault() {} });
  context.timers[1].handler();
  assert.equal(context.visits.at(-1), "/en/download/?code=EXAMPLE");
});

test("focusing or editing the code cancels the old automatic download fallback", () => {
  for (const event of ["focus", "input"]) {
    const context = page();
    context.input.listeners.get(event)();
    assert.deepEqual(context.cleared, [1]);
    context.timers[0].handler();
    assert.deepEqual(context.visits, ["bluephoto://app/premium?code=EXAMPLE"]);
    context.input.value = "  SECOND\n";
    context.form.submit({ preventDefault() {} });
    assert.equal(context.input.value, "SECOND");
    context.timers[1].handler();
    assert.equal(context.visits.at(-1), "/download/?code=SECOND");
  }
});

test("explicit manual submission on desktop attempts the app and then the existing download chooser", () => {
  const context = page({ search: "?code=EXAMPLE&preview=1", navigator: { userAgent: "Windows NT 10.0" } });
  assert.deepEqual(context.visits, []);
  context.form.submit({ preventDefault() {} });
  assert.deepEqual(context.visits, ["bluephoto://app/premium?code=EXAMPLE"]);
  assert.equal(context.status.textContent, "opening");
  context.timers[0].handler();
  assert.equal(context.visits[1], "/download/?code=EXAMPLE");
});

function download({ search = "", requested = "auto", navigator = ios, lang = "ko" } = {}) {
  const visits = [], tracks = [];
  const anchors = Object.entries(stores).map(([key, store]) => ({ dataset: { storePlatform: key }, href: store.url }));
  const document = { documentElement: { lang }, querySelector: selector =>
    selector === "[data-download-platform]" ? { dataset: { downloadPlatform: requested,
      downloadPath: lang === "en" ? "/project/en/download/" : "/download/" } } : {},
    querySelectorAll: () => anchors };
  mountDownloadPage({ document, navigator, window: { location: { search, replace: url => visits.push(url) } },
    track: (platform, source, navigate) => { tracks.push({ platform, source }); navigate(); } });
  return { visits, tracks, anchors };
}

test("download forwards validated codes to official fixed stores and keeps manual badge hrefs internal", () => {
  for (const [requested, navigator] of [["ios", ios], ["android", android]]) {
    const context = download({ search: "?code=EXAMPLE", requested, navigator });
    assert.deepEqual(context.visits, [promotionInstallURL("EXAMPLE", requested)]);
    assert.deepEqual(context.tracks, [{ platform: requested, source: "download_auto" }]);
    assert.equal(context.anchors[0].href, "/download/ios/?code=EXAMPLE");
    assert.equal(context.anchors[1].href, "/download/android/?code=EXAMPLE");
    assert.equal(context.anchors[2].href, stores.windows.url);
  }
  const google = new URL(promotionInstallURL("EXAMPLE", "android"));
  assert.equal(google.origin + google.pathname, "https://play.google.com/store/apps/details");
  assert.equal(google.searchParams.get("id"), "photo.bluewings.suwon");
  assert.equal(google.searchParams.get("referrer"), "promotion_code=EXAMPLE");
  const chooser = download({ search: "?code=EXAMPLE&preview=1", lang: "en" });
  assert.deepEqual(chooser.visits, []);
  assert.equal(chooser.anchors[1].href, "/project/en/download/android/?code=EXAMPLE");
});

test("ordinary or malformed-code downloads keep their fixed-store behavior, including preview and crawler guards", () => {
  for (const search of ["", "?code=BAD+CODE", "?code=A&code=B", "?url=https://evil.example"])
    assert.deepEqual(download({ search, navigator: android }).visits, [stores.android.url]);
  for (const requested of Object.keys(stores))
    assert.deepEqual(download({ requested }).visits, [stores[requested].url]);
  assert.deepEqual(download({ search: "?preview=1", requested: "ios" }).visits, []);
  assert.deepEqual(download({ requested: "ios", navigator: { userAgent: "Googlebot" } }).visits, []);
  assert.deepEqual(download({ requested: "__proto__" }).visits, []);
});
