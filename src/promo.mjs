import { mountBackground } from "./open-background.mjs";
import { kakaoOpenExternal, pageLanguage } from "./open-link.mjs";
import { slogans } from "./slogans.mjs";
import { parsePromotionCode, planPromotion, promotionAppLink, promotionAndroidIntent,
  promotionDownloadURL, validPromotionCode } from "./promo-link.mjs";

export function mountPromotionPage({ document, window, navigator, background = mountBackground }) {
  const page = document.querySelector("[data-promotion]");
  if (!page) return;
  const status = page.querySelector("[data-promotion-status]");
  const language = pageLanguage({ pathname: window.location.pathname, language: navigator.language });
  const message = key => page.dataset[`${key}${language === "en" ? "En" : "Ko"}`] ?? page.dataset[key];
  document.documentElement.lang = language;
  for (const node of document.querySelectorAll("[data-ko]")) {
    node.textContent = language === "ko" ? node.dataset.ko : node.dataset.en;
  }
  try {
    background({ document, window, slogans, icon: document.querySelector(".download-icon") });
  } catch {
    // Decoration must never prevent the app handoff.
  }

  const form = page.querySelector("[data-promotion-form]");
  const input = page.querySelector("[data-promotion-code]");
  let timer = null;
  let attempt = 0;
  let left = false;
  const cancelTimer = () => {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  };
  const leaving = () => { left = true; cancelTimer(); };
  document.addEventListener("visibilitychange", leaving);
  window.addEventListener("pagehide", leaving);
  window.addEventListener("blur", leaving);

  const open = (code, preview = false, manual = false) => {
    cancelTimer();
    const generation = ++attempt;
    left = false;
    if (!validPromotionCode(code)) {
      status.textContent = message("invalidCode");
      return;
    }
    let arrival = planPromotion({ code, userAgent: navigator.userAgent, platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints });
    if (manual && arrival.action === "none") arrival = { action: "app-scheme" };
    status.textContent = message(arrival.action === "none" ? "phoneRequired" : "opening");
    if (preview) return;
    const download = promotionDownloadURL(code, page.dataset.downloadPath);
    if (download === null) return;
    if (arrival.action === "android-intent") {
      window.location.replace(promotionAndroidIntent(code, new URL(download, window.location.href).href));
    } else if (arrival.action === "kakao-external") {
      const external = new URL(window.location.href);
      external.search = new URLSearchParams({ code });
      external.hash = "";
      window.location.replace(kakaoOpenExternal(external.href));
    } else if (arrival.action === "ios-scheme" || arrival.action === "app-scheme") {
      window.location.href = promotionAppLink(code);
      timer = window.setTimeout(() => {
        timer = null;
        if (generation === attempt && !left && !document.hidden) window.location.replace(download);
      }, 1800);
    }
  };
  form?.addEventListener("submit", event => {
    event.preventDefault();
    const code = input?.value.trim() ?? "";
    if (input) input.value = code;
    open(code, false, true);
  });
  const editing = () => { cancelTimer(); attempt += 1; };
  input?.addEventListener("focus", editing);
  input?.addEventListener("input", editing);
  const code = parsePromotionCode(window.location.search);
  if (input && code !== null) input.value = code;
  open(code, new URLSearchParams(window.location.search).get("preview") === "1");
}

if (typeof document !== "undefined" && typeof window !== "undefined")
  mountPromotionPage({ document, window, navigator });
