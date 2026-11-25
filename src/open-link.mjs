// Open a shared Blue Photo link in the app, or send the visitor to the store.
//
// App routes and store destinations are fixed. Only validated public identifiers and search text vary.
import { detectPlatform, stores } from "./site.mjs";

export const MEMORY_CARD_ID =
  /^memory_(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])_[0-9]{4}$/;
export const ANDROID_PACKAGE = "photo.bluewings.suwon";

/** The card id from `?m=`, or null when it is missing or malformed. */
export function parseMemoryId(search) {
  const value = new URLSearchParams(search).get("m");
  return value !== null && MEMORY_CARD_ID.test(value) ? value : null;
}

/** Return the canonical native path, or null for an unsupported destination. */
export function parseOpenPath(search) {
  const params = new URLSearchParams(search);
  const keys = ["m", "p", "q"].filter(key => params.has(key));
  if (keys.length !== 1) return null;
  if (keys[0] === "m") {
    const id = parseMemoryId(search);
    return id && `/collections/memory/${id}`;
  }
  if ([...params.keys()].length !== 1) return null;
  const value = params.get(keys[0]);
  if (keys[0] === "p") return /^photo_[0-9a-f]{32}$/.test(value) ? `/photos/${value}` : null;
  if (/[\p{Cc}\u2028\u2029\uFFFD]/u.test(value)) return null;
  const query = value.normalize("NFC").trim();
  if ([...query].length < 2 || query.length > 120) return null;
  // Native parsers accept canonical RFC 3986 component encoding.
  const encoded = encodeURIComponent(query).replace(/[!'()*]/g, c =>
    "%" + c.charCodeAt(0).toString(16).toUpperCase());
  return `/search?q=${encoded}`;
}

export function appLink(path) {
  return `bluephoto://app${path}`;
}

export function androidIntent(path) {
  return (
    `intent://app${path}#Intent;scheme=bluephoto;package=${ANDROID_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(stores.android.url)};end`
  );
}

/** KakaoTalk's documented way to hand a page to the system browser, where app links can open. */
export function kakaoOpenExternal(pageUrl) {
  return `kakaotalk://web/openExternal?url=${encodeURIComponent(pageUrl)}`;
}

/**
 * What to do on arrival. `none` leaves the page with its two visible buttons (crawlers, desktop browsers
 * and malformed links never navigate on their own).
 */
export function planOpen({ path, userAgent = "", platform = "", maxTouchPoints = 0 }) {
  if (path === null) return { action: "none" };
  const os = detectPlatform({ userAgent, platform, maxTouchPoints });
  if (os === "android") return { action: "android-intent" };
  if (os === "ios") {
    return /KAKAOTALK/i.test(userAgent)
      ? { action: "kakao-external" }
      : { action: "ios-scheme", fallback: stores.ios.url };
  }
  return { action: "none" };
}

/** The English route is always English; the Korean route (the shared link) follows the browser. */
export function pageLanguage({ pathname = "", language = "" }) {
  if (/^\/en(\/|$)/.test(pathname)) return "en";
  return language.toLowerCase().startsWith("en") ? "en" : "ko";
}

