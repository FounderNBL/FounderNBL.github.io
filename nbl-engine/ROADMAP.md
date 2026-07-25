# NBL Engine Extension Roadmap

## Runtime adapters

The Phase 1 domain layer is hosting-neutral. Future integrations should implement adapters rather than changing domain logic.

- **Frontend:** the existing site can consume engine APIs; a future React or Next.js experience can be added without replacing the domain layer.
- **Authentication:** Clerk, Auth0, or another identity service should map its subject identifier to `TravelerProfile.id`.
- **Payments:** Stripe, Payhip, or another subscription provider should emit membership-change events that update `membershipTier` through an adapter.
- **Object storage:** Cloudflare R2, Amazon S3, or compatible storage should implement asset and generated-output repositories.
- **AI orchestration:** a Python/FastAPI service may host image processing and generation workflows while calling the same engine contracts.
- **Background processing:** queues and workers should live behind job interfaces so long-running generation never blocks traveler requests.
- **Video generation:** every provider must implement `IVideoGenerator`; provider-specific request formats stay outside the Scene Director.

## Planned pipeline

1. Receive traveler image.
2. Validate file type, size, consent, and safety requirements.
3. Remove or isolate the background through an image-processing adapter.
4. Store the canonical traveler reference image securely.
5. Load the traveler, journey, and scene configuration.
6. Assemble provider-neutral scene instructions.
7. Submit work through the selected generation adapter.
8. Persist job state and generated outputs.
9. Notify the traveler through a notification adapter.
10. Advance the journey only after the experience has completed successfully.

## Security boundary

The public GitHub Pages deployment must never contain private traveler records, email addresses, authentication secrets, payment secrets, provider keys, or unprotected generated media.
