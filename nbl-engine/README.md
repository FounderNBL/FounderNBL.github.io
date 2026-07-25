# NBL Engine

NBL Engine is the orchestration and persistence foundation for immersive New Beansland experiences. It lives inside the existing New Beansland repository but remains logically separated from the static public site.

## Phase 1

This phase establishes:

- persistent Traveler records
- data-driven Scene definitions
- per-traveler Journey progression
- storage and repository interfaces
- a provider-neutral video generation contract
- the Scene Director orchestration service
- an initial Lantern Road scene package

## Architecture

```text
nbl-engine/
  api/          future HTTP or serverless adapters
  database/     future database migrations and adapters
  jobs/         future background-job workers and queues
  scenes/       data-driven scene packages
  src/
    engine/     orchestration services
    journey/    journey domain model
    scenes/     scene loading and validation
    storage/    persistence contracts and adapters
    traveler/   traveler domain model
    videos/     AI provider abstractions
    world/      scene and world definitions
  storage/      runtime storage notes and local data policy
  videos/       provider integration notes
```

## Important deployment boundary

GitHub Pages serves static files and cannot securely run this engine as a persistent backend. The code in this directory is intentionally hosting-neutral. A later phase can expose it through a serverless or Node runtime while the existing website remains the public entrance.

Do not place secrets, provider keys, traveler emails, or persistent traveler records in the public GitHub Pages output.

## Development

```bash
cd nbl-engine
npm install
npm run typecheck
npm run build
```

## Core rule

The engine supports the world; it must not flatten New Beansland into dashboards and forms. Technical state should be translated into place, movement, memory, and story at the experience layer.
