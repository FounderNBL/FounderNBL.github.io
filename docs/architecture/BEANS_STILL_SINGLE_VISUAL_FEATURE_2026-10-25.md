# Founder decision — Still is a Beans feature, not another public AI (2026-10-25)

**Authority:** latest explicit Founder direction. Preserve old implementation and costs; do not eat the acorn.

## Public identity and user experience

- **Beans is the only public conversational AI.** Still names his integrated Photos, Camera, image creation/editing and Canva visual toolbox, not another voice or independent chatbot.
- Still does not get an independent chat history, NBL sign-in, subscription, model provider call or paid reasoning pipeline.
- Website Beans' existing chat `mode:"beans"`, `toolMode:"image"`, attachment handling and server-side membership/image meter remain authoritative for image generation and analysis.
- A visitor opens Still > Canva **within the existing Beans chat panel**. The same signed-in Clerk identity calls `nbl-core/connect` using current per-customer Canva OAuth, with its current read-only/read-write capability gates.
- When a Canva design is created, Beans can refer to the result in the *current* chat. Local display context is not proof that the action was durably saved as an NBL conversation history event. Normal text chat history stays on the existing Beans rail.
- Connecting Canva may navigate to Canva's authorization/consent screen, and Canva design editing opens Canva in a separate tab. There is no invisible background transfer of Canva tokens to Google or OpenAI.

## Existing capability lanes (unchanged)

| Tool | Owner | Current status |
| --- | --- | --- |
| Photos and camera | Beans > Still | Native browser file picker/capture sends selected attachment to existing Beans request |
| Image understanding | Beans > Still | Existing image attachment analysis; same account and model routing |
| Image generation | Beans > Still | Existing OpenAI image tool with existing allowances; no new Gemini image call |
| Canva designs | Beans > Still | Customer-owned Canva Connect; design creation gated by `NBL_CANVA_DESIGN_WRITE_ENABLED` and customer consent; inspect/connect/create via existing `nbl-core/connect` |
| $2 extra image | NBL payment/LOCKE | Stripe product/price created **inactive**; checkout and extra allowance not live until verified customer purchase and fulfillment |
| Grey and Virgo | Protected University | No change, no public Still shortcut or protected teaching materials |

## Google agent decision

The Founder previously saved a separate Google Agent Platform agent labeled STILL. **It is not a second public NBL agent and is not used by this website feature.** Do not add a live Google endpoint, new Google credentials, new paid agent requests, or a public Google chat identity merely because that configuration exists. If Google credits/providers become useful, a separately authorized provider adapter may later serve Beans' visual tool **behind Beans**, not replace Beans' identity, login, or memory.

## Release and test gate

- Website-only now; Android Still feature/app parity deferred to V15.
- Preserve original Beans, Grey, messaging, books, music, games and billing. Never upload, sign or distribute an Android build for this change.
- Source tests: inspect one-identity routing, Clerk-authenticated Canva requests, no direct Google Agent call, and fail-closed design-write/$2 payment gates.
- Browser: Beans remains titled Beans when Still Canva opens; Still can close with existing conversation intact, on mobile and desktop.
- Real customer-owned Canva write needs app scope/approval, active server flag and authorized consent; never claim public Canva creation is live until demonstrated.
