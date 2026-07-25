import type { JourneyProgress } from "../journey/journey.js";
import type { TravelerProfile } from "../traveler/traveler.js";
import type { LoadedScene, SceneDefinition } from "../world/scene.js";
import type {
  JourneyRepository,
  SceneRepository,
  TravelerRepository
} from "./repositories.js";

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class InMemoryTravelerRepository implements TravelerRepository {
  private readonly travelers = new Map<string, TravelerProfile>();

  async findById(id: string): Promise<TravelerProfile | null> {
    const traveler = this.travelers.get(id);
    return traveler ? clone(traveler) : null;
  }

  async findByEmail(email: string): Promise<TravelerProfile | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const traveler = [...this.travelers.values()].find(
      (candidate) => candidate.email === normalizedEmail
    );
    return traveler ? clone(traveler) : null;
  }

  async save(traveler: TravelerProfile): Promise<void> {
    this.travelers.set(traveler.id, clone(traveler));
  }
}

export class InMemoryJourneyRepository implements JourneyRepository {
  private readonly journeys = new Map<string, JourneyProgress>();

  async findById(id: string): Promise<JourneyProgress | null> {
    const journey = this.journeys.get(id);
    return journey ? clone(journey) : null;
  }

  async findActiveByTravelerId(travelerId: string): Promise<JourneyProgress | null> {
    const journey = [...this.journeys.values()].find(
      (candidate) =>
        candidate.travelerId === travelerId &&
        candidate.status !== "completed"
    );
    return journey ? clone(journey) : null;
  }

  async save(journey: JourneyProgress): Promise<void> {
    this.journeys.set(journey.id, clone(journey));
  }
}

export class InMemorySceneRepository implements SceneRepository {
  private readonly scenes = new Map<string, LoadedScene>();

  constructor(initialScenes: LoadedScene[] = []) {
    for (const scene of initialScenes) {
      this.scenes.set(scene.definition.id, clone(scene));
    }
  }

  register(scene: LoadedScene): void {
    this.scenes.set(scene.definition.id, clone(scene));
  }

  async findDefinitionById(id: string): Promise<SceneDefinition | null> {
    const scene = this.scenes.get(id);
    return scene ? clone(scene.definition) : null;
  }

  async loadById(id: string): Promise<LoadedScene | null> {
    const scene = this.scenes.get(id);
    return scene ? clone(scene) : null;
  }
}
