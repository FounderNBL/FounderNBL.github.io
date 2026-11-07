// LOCKE: zero-new-key guard for human-to-human NBL Social.
// This is NOT an automated CSAM classifier. No suspected files go to OpenAI.
const DIRECT_MEDIA = /\.(?:png|jpe?g|gif|webp|heic|avif|svg|mp4|mov|webm|avi|mkv|mp3|wav|m4a|pdf|zip)(?:[?#]|$)/i;
const STORAGE_MEDIA = /\/storage\/v1\/object\/(?:public|sign|authenticated)\//i;
const EMBEDDED = /(?:data|blob|file):|<\s*(?:img|video|audio|iframe|embed|object)\b|!\[[^\]]*\]\s*\(/i;
const URLS = /https?:\/\/[^\s<>"'()]+/gi;

// Social is text-only until a real media safety pipeline is implemented.
// Direct image/video/file links and inline payloads must not circumvent that gate.
export function unsafeSocialMediaReason(value) {
  if (typeof value !== "string") return "invalid_message";
  const message = value.replace(/[\u200b-\u200f\u2060\ufeff]/g, "");
  if (EMBEDDED.test(message)) return "media_sharing_unavailable";
  for (const found of message.match(URLS) || []) {
    try {
      const url = new URL(found);
      const path = decodeURIComponent(url.pathname);
      if (DIRECT_MEDIA.test(path) || STORAGE_MEDIA.test(path) || /(?:^|\/)(?:attachments?|uploads?|media)\/[^/]+/i.test(path))
        return "media_sharing_unavailable";
    } catch {
      return "media_sharing_unavailable";
    }
  }
  // Prevent a simple data payload stuffed into a text message.
  if (/(?:base64,)[a-z0-9+/=]{64,}/i.test(message)) return "media_sharing_unavailable";
  return null;
}

// A user allegation can trigger a temporary hold, not a guilt determination.
// False reports must remain reviewable. Escalation/reporting to authorities is
// not automated and must never contain raw content without trained handling.
export function urgentSafetyAllegation(reason) {
  if (typeof reason !== "string") return false;
  const r = reason.normalize("NFKC").toLowerCase().replace(/[\u200b-\u200f\u2060\ufeff]/g, "");
  return /(?:\bcsam\b|\bchild(?:ren)?\b|\bminor(?:s)?\b|\bunderage\b|\bgroom(?:ing)?\b|\bsexual exploit(?:ation)?\b|\bsex trafficking\b|\bnon.?consensual intimate\b|\brevenge porn\b)/i.test(r);
}

export function safeSafetyQueueItem(row) {
  return {
    reportId: row.id,
    messageId: row.message_id,
    reason: row.metadata?.priority === "urgent" ? "Priority child-safety / exploitation concern" : String(row.reason||"").replace(/https?:\/\/\S+/gi,"[link withheld]").slice(0,160),
    status: row.status,
    priority: row.metadata?.priority === "urgent" ? "urgent" : "normal",
    held: row.metadata?.held === true,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at || null,
  };
}
