import type { IAIProvider, IVideoProvider } from "../providers/provider-contracts.js";

export interface TravelerSnapshot {
  id: string;
  name: string;
  membership: string;
  currentLocation: string;
  completedScenes: string[];
  journeyProgressPercent: number;
  referenceImageUri: string | null;
}

export interface SceneSnapshot {
  id: string;
  title: string;
  worldId: string;
  nextSceneId: string | null;
  promptTemplate: string;
  cinematic: boolean;
  allowsDirectMovementControl: boolean;
  metadata: Record<string, unknown>;
}

export interface DirectedExperience {
  travelerId: string;
  currentSceneId: string;
  nextSceneId: string | null;
  dialogue: string[];
  environment: Record<string, unknown>;
  progressionNotes: string[];
}

export interface DirectorContextRepository {
  loadTraveler(travelerId: string): Promise<TravelerSnapshot | null>;
  loadScene(sceneId: string): Promise<SceneSnapshot | null>;
  saveDirectedExperience(experience: DirectedExperience): Promise<void>;
}

export class AIDirector {
  constructor(
    private readonly repository: DirectorContextRepository,
    private readonly aiProvider: IAIProvider,
    private readonly videoProvider?: IVideoProvider
  ) {}

  async directNextExperience(travelerId: string): Promise<DirectedExperience> {
    const traveler = await this.repository.loadTraveler(travelerId);
    if (!traveler) throw new Error("Traveler not found.");

    const scene = await this.repository.loadScene(traveler.currentLocation);
    if (!scene) throw new Error("Current scene not found.");

    if (scene.allowsDirectMovementControl) {
      throw new Error("Still Walking scenes must remain cinematic and cannot enable direct movement control.");
    }

    const instructions = await this.aiProvider.createInstructions({
      travelerId: traveler.id,
      sceneId: scene.id,
      systemContext: "New Beansland is a living story world. Preserve continuity, dignity, memory, and authored progression.",
      storyContext: scene.promptTemplate,
      travelerContext: {
        name: traveler.name,
        membership: traveler.membership,
        completedScenes: traveler.completedScenes,
        journeyProgressPercent: traveler.journeyProgressPercent
      }
    });

    const experience: DirectedExperience = {
      travelerId: traveler.id,
      currentSceneId: scene.id,
      nextSceneId: scene.nextSceneId,
      dialogue: instructions.dialogue,
      environment: instructions.environment,
      progressionNotes: instructions.progressionNotes
    };

    await this.repository.saveDirectedExperience(experience);
    return experience;
  }

  getVideoProvider(): IVideoProvider | undefined {
    return this.videoProvider;
  }
}
