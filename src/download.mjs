import { detectPlatform, stores, copy } from "./site.mjs";
import { trackStoreExit } from "./analytics.mjs";
import { parsePromotionCode, promotionDownloadURL, promotionInstallURL } from "./promo-link.mjs";

export function mountDownloadPage({ document, window, navigator, track = trackStoreExit }) {
  const page = document.querySelector("[data-download-platform]");
  if (!page) return;
  const code = parsePromotionCode(window.location.search);
  if (code !== null) {
    for (const anchor of document.querySelectorAll("a[data-store-platform]")) {
      const platform = anchor.dataset.storePlatform;
      if (platform !== "ios" && platform !== "android") continue;
      const destination = promotionDownloadURL(code, page.dataset.downloadPath, platform);
      if (destination !== null) anchor.href = destination;
    }
  }
  if (new URLSearchParams(window.location.search).get("preview") === "1") return;
  const requested = page.dataset.downloadPlatform;
  const detected = detectPlatform(navigator);
  const isCrawler =
    /bot|crawler|spider|preview|facebookexternalhit|slack|discord|whatsapp|telegram/i.test(
      navigator.userAgent,
    );
  const platform = requested === "auto" ? detected : requested;
  if (!isCrawler && Object.hasOwn(stores, platform)) {
    const lang = document.documentElement.lang === "en" ? "en" : "ko";
    const status = document.querySelector("[data-download-status]");
    if (status) status.textContent = copy[lang].redirect;
    const destination = (code === null ? null : promotionInstallURL(code, platform)) ?? stores[platform].url;
    track(platform, "download_auto", () =>
      window.location.replace(destination),
    );
  }
}

if (typeof document !== "undefined" && typeof window !== "undefined")
  mountDownloadPage({ document, window, navigator });
