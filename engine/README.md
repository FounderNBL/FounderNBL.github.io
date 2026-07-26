# NBL Engine

NBL Engine is the software layer beneath New Beansland. The public website is the entrance; the engine is the world memory and orchestration system.

## Product rules

- New Beansland is a living place, not a conventional website.
- Travelers are remembered across visits.
- Progress persists unless a story explicitly resets it.
- Still Walking is an authored cinematic journey, not a movement-controlled game.
- AI, storage, authentication, payments, and media vendors remain replaceable adapters.
- Public pages must never contain secrets or production persistence logic.

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
  tests/
```

## First experience

On first enrollment, the engine emits a one-time arrival experience:

> Welcome, Traveler.
>
> The road has been waiting for you.

After the frontend acknowledges the arrival, it does not replay accidentally.

## Still Walking

A Traveler supplies a reference photo. The engine remembers that identity and periodically delivers cinematic scenes showing the Traveler deeper inside New Beansland. The Traveler does not steer an avatar. The world continues moving through authored and AI-assisted scenes.

## Development

```bash
cd engine
npm install
npm run typecheck
npm test
```

## Deployment boundary

GitHub Pages remains the public front door. Production traveler accounts, payment webhooks, private media, background jobs, database persistence, and AI-provider secrets require a separate secure backend deployment. Domain code stays hosting-neutral so it can be used by a future TypeScript or FastAPI service.
