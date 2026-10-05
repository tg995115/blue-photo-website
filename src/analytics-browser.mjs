import { trackStoreExit } from "./analytics.mjs";

const storeHosts = new Set([
  "apps.apple.com",
  "play.google.com",
  "apps.microsoft.com",
]);

document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const anchor = event.target.closest?.("a[data-store-platform]");
  if (!anchor || (anchor.target && anchor.target !== "_self")) return;
  const destination = new URL(anchor.href);
  if (destination.protocol !== "https:" || !storeHosts.has(destination.hostname))
    return;

  event.preventDefault();
  trackStoreExit(
    anchor.dataset.storePlatform,
    anchor.dataset.storeSource || "manual",
    () => window.location.assign(destination.href),
  );
});
