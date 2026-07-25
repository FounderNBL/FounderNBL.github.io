# NBL Engine

NBL Engine is the software layer beneath New Beansland. The public website is the entrance; the engine is the world memory and orchestration system.

## Product rules

- New Beansland is a living place, not a conventional website.
- Travelers are remembered across visits.
- Progress persists unless a story explicitly resets it.
- Still Walking is an authored cinematic journey, not a movement-controlled game.
- AI, storage, authentication, payments, and media vendors must remain replaceable adapters.
- Public pages must not contain secrets or production persistence logic.

## Canonical structure

```text
engine/
  api/
  ai/
  travelers/
  journeys/
  scenes/
  memberships/
  media/
  auth/
  database/
  providers/
```

## First experience

On the first completed enrollment, the engine emits a one-time arrival experience:

> Welcome, Traveler.
>
> The road has been waiting for you.

The frontend acknowledges the event after it has been shown so it does not replay accidentally.

## Still Walking

A Traveler supplies a reference photo. The engine remembers that identity and periodically delivers cinematic scenes showing the Traveler deeper inside New Beansland. The Traveler does not steer an avatar. The world continues moving through authored and AI-assisted scenes.

## Deployment boundary

GitHub Pages remains the public front door. Production traveler accounts, Stripe webhooks, private media, background jobs, and AI-provider secrets require a separate secure backend deployment. Domain code in this folder stays hosting-neutral so it can be used by a future FastAPI service, a TypeScript service, or both.

## Existing Phase 1 work

The earlier `nbl-engine/` prototype remains in Pull Request #2 while this canonical `/engine` layout is introduced. New work belongs in `/engine`; the prototype should be migrated and removed before the subsystem is merged to `main` to avoid duplicated ownership.
