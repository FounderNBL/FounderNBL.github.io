// MY PULSE bridge input policy. Pure helpers; no network, auth or publishing.
export const CHANNELS = Object.freeze(["pulse","facebook_page","instagram"]);
export function validateDraft(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw Error("invalid_request");
  const channels = input.channels;
  if (!Array.isArray(channels) || !channels.length || channels.length > 3 ||
      new Set(channels).size !== channels.length ||
      channels.some(ch => !CHANNELS.includes(ch))) throw Error("invalid_channels");
  const identity = input.identity;
  if (!["founder","jmelo","newbeansland","shia"].includes(identity)) throw Error("invalid_identity");
  const caption = typeof input.caption === "string" ? input.caption.trim() : "";
  if (!caption || caption.length > 1500) throw Error("invalid_caption");
  const media = input.media;
  if (!Array.isArray(media) || media.length < 1 || media.length > 4) throw Error("invalid_media");
  const images = media.map(url => {
    if (typeof url !== "string" || url.length > 2048) throw Error("invalid_media_url");
    let u; try { u = new URL(url); } catch { throw Error("invalid_media_url"); }
    // The same trusted Stream-hosted image domain currently accepted by Pulse.
    if (u.protocol !== "https:" || !u.hostname.endsWith(".stream-io-cdn.com") ||
        u.username || u.password) throw Error("untrusted_media_url");
    return u.href;
  });
  // Account IDs are explicit. No fallback between personal, company or artist.
  const account = input.account;
  if (typeof account !== "string" || !/^[a-zA-Z0-9:_-]{3,100}$/.test(account)) throw Error("invalid_account");
  return {identity,channels,account,caption,media:images};
}
export async function fingerprint(draft) {
  const bytes = new TextEncoder().encode(JSON.stringify(draft));
  const hash = await crypto.subtle.digest("SHA-256",bytes);
  return [...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,"0")).join("");
}
