(() => {
  "use strict";
  const STUDIO_API = "https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-studios";
  const BILLING_API = "https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-billing-link";
  const $ = (id) => document.getElementById(id);
  const els = {
    model: $("model"),
    modelInfo: $("modelInfo"), prompt: $("prompt"), imageUrl: $("imageUrl"),
    cost: $("quotedCost"), form: $("createForm"), createButton: $("createButton"),
    catalogStatus: $("catalogStatus"), createStatus: $("createStatus"),
    signIn: $("signIn"), accountStatus: $("accountStatus"), balance: $("balance"),
    buy: $("buyCredits"), refreshWallet: $("refreshWallet"),
    output: $("output"), jobStatus: $("jobStatus"), refreshJob: $("refreshJob")
  };
  const mediaKind = "video";
  let models = [];
  let token = null;
  let wallet = null;
  let founder = false;
  let latestTask = null;
  let latestKind = null;
  let pollTimer = null;
  let pollsLeft = 0;
  let creating = false;

  function setStatus(message, style = "") {
    els.createStatus.textContent = message;
    els.createStatus.className = "status " + style;
  }

  async function request(url, action, data = {}, signed = false) {
    const headers = {"Content-Type": "application/json", "Accept": "application/json"};
    if (signed) {
      const fresh = await window.NBLAccountBridge?.getToken?.();
      if (!fresh) throw new Error("Sign in to your NBL account to continue.");
      headers.Authorization = "Bearer " + fresh;
    }
    if (action === "generate") {
      // Unique per deliberate click; protects credit reservation during retries.
      headers["x-request-id"] = crypto.randomUUID();
    }
    const response = await fetch(url, {
      method: "POST", headers, cache: "no-store",
      body: JSON.stringify({action, ...data})
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      const messages = {
        sign_in_required: "Sign in to create with NBL Studios.",
        insufficient_studio_credits: "Not enough Studio Credits for this generation.",
        start_image_required_for_model: "That model needs a starting image URL.",
        studios_generation_not_configured: "Studio generation isn't available right now.",
        generation_submission_failed: "The generation service couldn't accept this job.",
        job_not_found: "That job is unavailable for this account."
      };
      const reason = body.reason || body.code || body.message;
      const error = new Error(messages[reason] || body.message || "NBL Studios is temporarily unavailable.");
      error.reason = reason;
      error.payload = body;
      throw error;
    }
    return body;
  }

  function priceFor(model) {
    const base = Number(model?.studio_credit_cost || 0);
    const extra = els.imageUrl.value.trim() ? Number(model?.reference_image_credit_cost || 0) : 0;
    return base + extra;
  }

  function selectedModel() {
    return models.find(m => m.model_key === els.model.value) || null;
  }

  function updateControls() {
    const selected = selectedModel();
    els.cost.textContent = selected ? String(priceFor(selected)) : "—";
    const needImage = selected?.requires_start_image === true;
    els.imageUrl.required = needImage;
    els.modelInfo.textContent = selected
      ? ((selected.duration_seconds ? selected.duration_seconds + "-second clip · " : "") +
         (selected.metadata?.priceLabel || priceFor(selected) + " NBL Studios Credits") +
         (needImage ? " · Starting image required" : ""))
      : "Choose a model to see its NBL Studios Credit cost.";
    els.createButton.disabled = creating || !selected || !token || (!founder && (!wallet || Number(wallet.balanceCredits) < priceFor(selected)));
    if (!creating && selected && token && !founder && wallet && Number(wallet.balanceCredits) < priceFor(selected)) {
      setStatus("Your wallet needs more credits. Credit purchases are currently held for checkout verification.");
    }
  }

  function renderModels() {
    const current = els.model.value;
    const filtered = models.filter(m => m.media_kind === mediaKind);
    els.model.replaceChildren();
    els.model.append(new Option("Choose a production model", ""));
    filtered.forEach(m => els.model.append(new Option(m.display_name + " · " + m.studio_credit_cost + " credits", m.model_key)));
    if (filtered.some(m => m.model_key === current)) els.model.value = current;
    els.model.disabled = filtered.length === 0;
    updateControls();
  }

  async function loadCatalog() {
    try {
      const data = await request(STUDIO_API, "models");
      // Only video products belong in NBL Studios. Preserve the private image registry for other future products.
      models = Array.isArray(data.models) ? data.models.filter(model => model.media_kind === "video") : [];
      els.catalogStatus.textContent = models.length + " available models";
      renderModels();
    } catch (e) {
      els.catalogStatus.textContent = "Catalog unavailable. Please try later.";
      setStatus(e.message, "error");
    }
  }

  async function refreshWallet() {
    if (!token) return;
    try {
      const state = await request(STUDIO_API, "wallet", {}, true);
      wallet = state.wallet;
      founder = Boolean(state.founder);
      els.balance.textContent = founder ? "Founder" : String(Number(wallet?.balanceCredits || 0));
      els.accountStatus.textContent = founder ? "Founder production access" : "Available NBL Studios Credits";
      updateControls();
    } catch (e) {
      els.accountStatus.textContent = e.message;
      els.balance.textContent = "—";
      wallet = null;
      updateControls();
    }
  }

  async function loadAccount() {
    const fallback = "https://accounts.newbeansland.org/sign-in";
    els.signIn.href = window.NBLAuthFlow?.accountPortalUrl?.("/sign-in", location.href) || fallback;
    try {
      const bridge = window.NBLAccountBridge;
      if (!bridge) throw new Error("NBL sign-in connection unavailable.");
      const clerk = await bridge.getClerk();
      token = await bridge.getToken();
      if (!clerk?.isSignedIn || !token) {
        els.accountStatus.textContent = "Sign in to see your credit wallet and submit creations.";
        els.balance.textContent = "—";
      } else {
        els.signIn.hidden = true;
        els.accountStatus.textContent = "Signed in · Loading credits…";
        await refreshWallet();
      }
    } catch (e) {
      els.accountStatus.textContent = e.message;
    }
    updateControls();
  }

  function clearPoll() {
    if (pollTimer !== null) window.clearTimeout(pollTimer);
    pollTimer = null;
  }

  async function checkJob() {
    if (!latestTask) return;
    clearPoll();
    try {
      const result = await request(STUDIO_API, "status", {taskId: latestTask}, true);
      const state = result.status || "running";
      if (result.wallet) {
        wallet = result.wallet;
        els.balance.textContent = String(Number(wallet.balanceCredits || 0));
        updateControls();
      }
      if (state === "succeeded") {
        els.jobStatus.textContent = "Finished! Save your creation.";
        els.output.replaceChildren();
        const url = new URL(String(result.outputUrl || ""));
        if (url.protocol !== "https:") throw new Error("The output link is not available.");
        const media = document.createElement(latestKind === "image" ? "img" : "video");
        media.src = url.href;
        if (latestKind === "video") {
          media.controls = true;
          media.playsInline = true;
        } else media.alt = "Generated NBL Studios creation";
        const link = document.createElement("a");
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open generated file";
        els.output.append(media, link);
        els.refreshJob.hidden = true;
        return;
      }
      els.jobStatus.textContent = "Your job is " + state + ".";
      if (pollsLeft-- > 0) pollTimer = window.setTimeout(checkJob, 10000);
      else els.jobStatus.textContent += " Check status again when you're ready.";
    } catch (e) {
      els.jobStatus.textContent = e.reason === "generation_failed"
        ? "Generation failed. Any reserved credits should be refunded; refresh your wallet to confirm."
        : e.message;
      if (e.reason === "generation_failed") await refreshWallet();
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (creating) return;
    const model = selectedModel();
    if (!model || !token) return;
    const promptText = els.prompt.value.trim();
    if (!promptText) return setStatus("Describe your scene before creating.", "error");
    const promptImage = els.imageUrl.value.trim();
    if (promptImage && !/^https:\/\//i.test(promptImage)) return setStatus("Starting image URL must use HTTPS.", "error");
    creating = true;
    updateControls();
    setStatus("Submitting your creation…");
    try {
      const result = await request(STUDIO_API, "generate", {modelKey: model.model_key, promptText, ...(promptImage ? {promptImage} : {})}, true);
      if (!result.taskId) throw new Error("Generation was submitted without a task ID.");
      latestTask = result.taskId;
      latestKind = mediaKind;
      els.output.replaceChildren();
      els.jobStatus.textContent = "Submitted. Waiting for production…";
      els.refreshJob.hidden = false;
      if (result.wallet) {
        wallet = result.wallet;
        els.balance.textContent = String(Number(wallet.balanceCredits || 0));
      }
      setStatus("Generation submitted. Reserved " + Number(result.chargedStudioCredits || 0) + " credits.", "success");
      pollsLeft = 36;
      pollTimer = window.setTimeout(checkJob, 8000);
    } catch (error) {
      setStatus(error.message, "error");
      if (error.reason === "insufficient_studio_credits") await refreshWallet();
    } finally {
      creating = false;
      updateControls();
    }
  }

  async function buyCredits() {
    els.buy.disabled = true;
    setStatus("Checking secure Studios checkout…");
    try {
      const result = await request(BILLING_API, "checkout", {plan: "studios_500"}, true);
      const url = new URL(String(result.checkoutUrl || ""));
      if (url.protocol !== "https:" || !["checkout.stripe.com", "buy.stripe.com"].includes(url.hostname)) throw new Error("Checkout destination was not verified.");
      window.location.assign(url.href);
    } catch (error) {
      setStatus(error.reason === "PRICE_CHECKOUT_HELD"
        ? "New credit purchases are temporarily held while NBL verifies checkout. No charge was made."
        : error.message, "error");
    } finally {
      els.buy.disabled = false;
    }
  }

  els.model.addEventListener("change", updateControls);
  els.imageUrl.addEventListener("input", updateControls);
  els.form.addEventListener("submit", submit);
  els.refreshWallet.addEventListener("click", refreshWallet);
  els.refreshJob.addEventListener("click", checkJob);
  els.buy.addEventListener("click", buyCredits);
  void Promise.all([loadCatalog(), loadAccount()]);
})();
