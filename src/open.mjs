import {
  androidIntent,
  appLink,
  kakaoOpenExternal,
  parseMemoryId,
  planOpen,
} from "./open-link.mjs";
import { stores } from "./site.mjs";

const korean = !(navigator.language || "").toLowerCase().startsWith("en");
document.documentElement.lang = korean ? "ko" : "en";
for (const node of document.querySelectorAll("[data-ko]")) {
  node.textContent = korean ? node.dataset.ko : node.dataset.en;
}

const id = parseMemoryId(window.location.search);
const openButton = document.querySelector("[data-open-app]");
const storeButton = document.querySelector("[data-store]");
const platformStore = (() => {
  if (/android/i.test(navigator.userAgent)) return stores.android.url;
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return stores.ios.url;
  return null;
})();
if (storeButton) storeButton.href = platformStore ?? "../download/";
if (openButton) {
  if (id === null) openButton.hidden = true;
  else openButton.href = appLink(id);
}

const plan = planOpen({
  id,
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  maxTouchPoints: navigator.maxTouchPoints,
});
if (plan.action === "android-intent") {
  window.location.replace(androidIntent(id));
} else if (plan.action === "kakao-external") {
  window.location.replace(kakaoOpenExternal(window.location.href));
} else if (plan.action === "ios-scheme") {
  // Without the app Safari cannot open the address and stays on this page; with it the page is hidden.
  let left = false;
  const leaving = () => {
    left = true;
  };
  document.addEventListener("visibilitychange", leaving);
  window.addEventListener("pagehide", leaving);
  window.addEventListener("blur", leaving);
  window.location.href = appLink(id);
  window.setTimeout(() => {
    if (!left && !document.hidden) window.location.replace(plan.fallback);
  }, 1800);
}
