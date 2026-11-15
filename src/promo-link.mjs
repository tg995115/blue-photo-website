import { ANDROID_PACKAGE } from "./open-link.mjs";
import { detectPlatform, stores } from "./site.mjs";

export const validPromotionCode = (code) => typeof code === "string" && /^[A-Za-z0-9]{1,64}$/.test(code);

export function parsePromotionCode(search) {
  if (typeof search !== "string" || !/^\?(?:code=[A-Za-z0-9]{1,64}(?:&preview=1)?|preview=1&code=[A-Za-z0-9]{1,64})$/.test(search)) return null;
  return new URLSearchParams(search).get("code");
}

export function promotionAppLink(code) {
  return validPromotionCode(code) ? `bluephoto://app/premium?code=${code}` : null;
}

export function promotionInstallURL(code, platform) {
  if (!validPromotionCode(code)) return null;
  if (platform === "ios") {
    const url = new URL("https://apps.apple.com/redeem");
    url.search = new URLSearchParams({ ctx: "offercodes", id: "6801591787", code });
    return url.href;
  }
  if (platform === "android") {
    const url = new URL(stores.android.url);
    url.searchParams.set("referrer", new URLSearchParams({ promotion_code: code }).toString());
    return url.href;
  }
  return null;
}

export function promotionDownloadURL(code, downloadPath, platform = null) {
  if (!validPromotionCode(code) || typeof downloadPath !== "string" ||
    !/^\/(?:[A-Za-z0-9_-][A-Za-z0-9._-]*\/)*download\/$/.test(downloadPath) ||
    platform !== null && !Object.hasOwn(stores, platform)) return null;
  return `${downloadPath}${platform === null ? "" : `${platform}/`}?code=${code}`;
}

export function promotionAndroidIntent(code, fallback) {
  if (!validPromotionCode(code) || typeof fallback !== "string") return null;
  return `intent://app/premium?code=${code}#Intent;scheme=bluephoto;package=${ANDROID_PACKAGE};` +
    `S.browser_fallback_url=${encodeURIComponent(fallback)};end`;
}

export function planPromotion({ code, userAgent = "", platform = "", maxTouchPoints = 0 }) {
  if (!validPromotionCode(code)) return { action: "none" };
  const os = detectPlatform({ userAgent, platform, maxTouchPoints });
  if (os === "android") return { action: "android-intent" };
  if (os === "ios") return /KAKAOTALK/i.test(userAgent)
    ? { action: "kakao-external" }
    : { action: "ios-scheme" };
  return { action: "none" };
}
