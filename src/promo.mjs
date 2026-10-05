const code = document.querySelector("[data-promo-code]");
const button = document.querySelector("[data-promo-copy]");
const status = document.querySelector("[data-promo-copy-status]");

if (code && button && status && navigator.clipboard?.writeText) {
  button.hidden = false;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code.dataset.promoCode);
      status.textContent = status.dataset.success;
    } catch {
      status.textContent = status.dataset.failure;
    }
  });
}
