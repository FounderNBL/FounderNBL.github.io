import { test, expect } from "@playwright/test";

// Automated browser regression for the real Pulse interface, no paid provider
// calls or simulated audience metrics. This tests that existing WebRTC media
// elements are visible, NOT that Stream has delivered actual remote frames.
const LIVE = "https://tvypdakofcrlvnwporhh.supabase.co/functions/v1/nbl-live";
const VIDEO_SDK = "export class StreamVideoClient {\n  constructor(options) { this.user = options.user; }\n  call() {\n    const myself = this.user.id;\n    return {\n      camera: { disable: async () => {} },\n      microphone: { disable: async () => {}, disableSpeakingWhileMutedNotification: async () => {} },\n      join: async () => {}, leave: async () => {},\n      bindVideoElement: (element) => { if (!element.isConnected || !element.getBoundingClientRect().width || !element.getBoundingClientRect().height) throw Error('Stream refused to subscribe to a hidden or detached video'); return () => {}; },\n      bindAudioElement: () => () => {},\n      state: { participants$: { subscribe(callback) {\n        callback([{ sessionId: \"local-\" + myself, isLocalParticipant: true }, { sessionId: \"remote-broadcaster\", isLocalParticipant: false, name: \"NBL broadcaster\", publishedTracks: [1, 2] }]);\n        return { unsubscribe() {} };\n      } } }\n    };\n  }\n  async disconnectUser() {}\n}";
const json = (body, status=200) => ({
  status, contentType: "application/json",
  headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type" },
  body: JSON.stringify(body)
});

test("a confirmed Pulse-only LIVE broadcast is discoverable and the joined WebRTC picture is visible", async ({page}) => {
  const actions=[];
  await page.addInitScript(() => {
    window.Clerk = {
      load: async () => {},
      isSignedIn: true,
      user: {id: "synthetic-viewer"},
      session: { getToken: async () => "synthetic-viewer-token" }
    };
  });
  await page.route("**/messenger/social-v1.mjs**", route => route.fulfill({status:200,contentType:"text/javascript",body:""}));
  await page.route(/https:\/\/esm\.sh\/@stream-io\/video-client.*/, route => route.fulfill({
    status:200,contentType:"text/javascript",
    headers:{"access-control-allow-origin":"*"},body:VIDEO_SDK
  }));
  await page.route("https://tvypdakofcrlvnwporhh.supabase.co/**", route => {
    const req=route.request();
    if (req.method() === "OPTIONS") return route.fulfill(json({ok:true}));
    if(req.url().split("?")[0] !== LIVE) return route.fulfill(json({ok:false,reason:"not_found"},404));
    const action=req.postDataJSON()?.action;
    actions.push(action);
    if(action==="status")return route.fulfill(json({
      ok:true,enabled:true,status:"live",isAdmin:false,isHost:false,
      callId:"11111111-1111-4111-8111-111111111111",
      title:"Live from Pulse, not a saved video",startedAt:new Date().toISOString(),
      hlsPlaylistUrl:null,facebook:{configured:false,enabled:false,status:"disabled"}
    }));
    if(action==="join-viewer")return route.fulfill(json({
      ok:true,callId:"11111111-1111-4111-8111-111111111111",
      callType:"livestream",key:"synthetic-public-key",token:"synthetic-video-token"
    }));
    return route.fulfill(json({ok:false,reason:"not_found"},404));
  });

  await page.goto("/pulse/", {waitUntil:"domcontentloaded"});
  await page.evaluate(() => {document.querySelector("#socialApp").hidden=false;});

  // Passive feed discovery must never reserve a paid viewer connection.
  const liveCard=page.locator("#pulseLiveFeedAlert");
  await expect(liveCard).toBeVisible();
  await expect(liveCard).toContainText("Live from Pulse, not a saved video");
  await expect(page.locator("#pulseLiveViewer")).toBeHidden();
  expect(actions.filter(action=>action==="join-viewer")).toHaveLength(0);

  // Click WATCH LIVE: WebRTC participants must appear inside a visible player.
  await liveCard.locator('[data-view="live"]').click();
  await expect(page.locator("#pulseLiveView")).toBeVisible();
  await expect(page.locator("#pulseLiveViewer")).toBeVisible();
  await expect(page.locator("#pulseLiveViewer .pulse-live-remote video")).toBeVisible();
  await expect(page.locator("#pulseLiveViewers")).toContainText("viewer");
  expect(actions.filter(action=>action==="join-viewer")).toHaveLength(1);

  // Leaving Live closes the viewer without ending or controlling the host.
  await page.locator('button[data-view="home"]:visible').first().click();
  await expect(page.locator("#pulseLiveViewer")).toBeHidden();
  expect(actions).not.toContain("end");
});
