const platforms = new Set(["ios", "android", "windows"]);

// Called only for reviewed store destinations. No URL or promo code is sent to GA4.
export function trackStoreExit(platform, source, navigate) {
  if (
    !platforms.has(platform) ||
    window.bluePhotoAnalyticsEnabled !== true ||
    typeof window.gtag !== "function"
  ) {
    navigate();
    return;
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(timer);
    navigate();
  };
  const timer = window.setTimeout(finish, 700);
  try {
    window.gtag("event", "store_exit", {
      platform,
      source,
      event_callback: finish,
      event_timeout: 700,
    });
  } catch {
    finish();
  }
}
