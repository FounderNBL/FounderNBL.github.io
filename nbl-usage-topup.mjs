// NBL Usage refill: display-only quote. Not a payment or grant authority.
// This file intentionally never calls Stripe, opens checkout, or updates a wallet.
// A future server-side checkout must compute and verify the amount independently.
export const TOP_UP_DOLLARS = Object.freeze([10, 20, 50]);
export const CREDITS_PER_DOLLAR = 70; // Proposed conversion, not an active offer.
export function quoteUsageTopup(dollars) {
  if (!Number.isSafeInteger(dollars) || !TOP_UP_DOLLARS.includes(dollars)) {
    throw new RangeError("Unsupported NBL Usage top-up amount");
  }
  return Object.freeze({dollars, cents: dollars * 100, credits: dollars * CREDITS_PER_DOLLAR});
}
if (typeof document !== "undefined") {
  const selector = document.getElementById("nblUsageTopupAmount");
  const preview = document.getElementById("nblUsageTopupPreview");
  const checkout = document.getElementById("nblUsageTopupCheckout");
  if (selector && preview && checkout) {
    checkout.disabled = true; // Fail closed until authenticated backend is verified.
    const refresh = () => {
      try {
        const amount = quoteUsageTopup(Number(selector.value));
        preview.textContent = `Proposed: $${amount.dollars} one-time adds ${amount.credits.toLocaleString("en-US")} NBL Usage credits.`;
      } catch {
        preview.textContent = "Choose an available refill amount.";
      }
    };
    selector.addEventListener("change", refresh);
    refresh();
  }
}
