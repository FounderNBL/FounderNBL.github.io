export function createGateController({ modal, closeButton, unlockButton, statusNode, onClose }) {
  let opened = false;

  function open() {
    opened = true;
    modal.hidden = false;
    statusNode.textContent = "";
  }

  function close() {
    modal.hidden = true;
    statusNode.textContent = "";
    opened = false;
    onClose?.();
  }

  async function beginCheckout() {
    unlockButton.disabled = true;
    unlockButton.textContent = "Opening the gate…";
    statusNode.textContent = "Preparing secure checkout…";
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: "mystic-next-chamber" })
      });
      if (!response.ok) throw new Error(`Checkout unavailable (${response.status})`);
      const data = await response.json();
      if (!data?.url) throw new Error("Checkout session did not return a redirect URL.");
      window.location.assign(data.url);
    } catch (error) {
      console.error(error);
      statusNode.textContent = "The payment gate is not connected yet. No charge was made.";
      unlockButton.disabled = false;
      unlockButton.textContent = "Unlock the Next Chamber";
    }
  }

  closeButton.addEventListener("click", close);
  unlockButton.addEventListener("click", beginCheckout);

  return { open, close, isOpen: () => opened };
}
