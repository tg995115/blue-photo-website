// Only the decorative background needs client React. All content stays static.
const host = document.querySelector("[data-gradient-root]");
if (host) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let inView = false;
  let controller = null;
  let loading = null;
  let unavailable = false;

  const isActive = () => inView && !document.hidden && !reducedMotion.matches;
  function reconcile() {
    controller?.setActive(isActive());
    if (!isActive() || controller || loading || unavailable) return;
    loading = import("./gradient.jsx")
      .then(({ mountGradient }) => {
        if (isActive())
          controller = mountGradient(host, () => {
            unavailable = true;
          });
      })
      .catch(() => {
        // A static CSS gradient remains if the optional effect cannot load.
        unavailable = true;
      })
      .finally(() => {
        loading = null;
      });
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      reconcile();
    },
    { threshold: 0 },
  );
  observer.observe(host);
  reducedMotion.addEventListener("change", reconcile);
  document.addEventListener("visibilitychange", reconcile);
  window.addEventListener("pagehide", () => controller?.setActive(false));
  window.addEventListener("pageshow", reconcile);
}
