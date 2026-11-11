// Open a shared Blue Photo link in the app, or send the visitor to the store.
//
// Only a validated Memory card id is ever placed in the app link, and the store destinations are the
// fixed reviewed URLs in site.mjs. Nothing in the address can choose where the visitor is sent.
import { detectPlatform, stores } from "./site.mjs";

export const MEMORY_CARD_ID =
  /^memory_(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])_[0-9]{4}$/;
export const ANDROID_PACKAGE = "photo.bluewings.suwon";

/** The card id from `?m=`, or null when it is missing or malformed. */
export function parseMemoryId(search) {
  const value = new URLSearchParams(search).get("m");
  return value !== null && MEMORY_CARD_ID.test(value) ? value : null;
}

export function appLink(id) {
  return `bluephoto://app/collections/memory/${id}`;
}

/** Chrome's intent URL: opens the installed app, or goes to the Play page when it is missing. */
export function androidIntent(id) {
  return (
    `intent://app/collections/memory/${id}#Intent;scheme=bluephoto;package=${ANDROID_PACKAGE};` +
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
export function planOpen({ id, userAgent = "", platform = "", maxTouchPoints = 0 }) {
  if (id === null) return { action: "none" };
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

