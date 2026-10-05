import { detectPlatform, stores, copy } from "./site.mjs";
import { trackStoreExit } from "./analytics.mjs";

const page = document.querySelector("[data-download-platform]");
if (
  page &&
  new URLSearchParams(window.location.search).get("preview") !== "1"
) {
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
    trackStoreExit(platform, "download_auto", () =>
      window.location.replace(stores[platform].url),
    );
  }
}
