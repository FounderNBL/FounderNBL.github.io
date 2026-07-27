import type { JourneyProgress } from "../journeys/journey.js";
import type { TravelerProfile } from "../travelers/traveler.js";
import type { LoadedScene, SceneDefinition } from "../scenes/scene.js";

export interface TravelerRepository {
  findById(id: string): Promise<TravelerProfile | null>;
  findByEmail(email: string): Promise<TravelerProfile | null>;
  save(traveler: TravelerProfile): Promise<void>;
}

export interface JourneyRepository {
  findById(id: string): Promise<JourneyProgress | null>;
  findActiveByTravelerId(travelerId: string): Promise<JourneyProgress | null>;
  save(journey: JourneyProgress): Promise<void>;
}

export interface SceneRepository {
  findDefinitionById(id: string): Promise<SceneDefinition | null>;
  loadById(id: string): Promise<LoadedScene | null>;
}

export interface EngineRepositories {
  travelers: TravelerRepository;
  journeys: JourneyRepository;
  scenes: SceneRepository;
}
