import {
  completeCurrentScene,
  getCurrentStep,
  getNextStep,
  startJourney,
  type JourneyProgress
} from "../journey/journey.js";
import type { EngineRepositories } from "../storage/repositories.js";
import {
  markArrivalExperienceSeen,
  shouldShowArrivalExperience,
  type TravelerProfile
} from "../traveler/traveler.js";
import type { IVideoGenerator, VideoJob } from "../videos/video-generator.js";
import type { LoadedScene } from "../world/scene.js";

export interface TravelerLocation {
  traveler: TravelerProfile;
  journey: JourneyProgress;
  currentScene: LoadedScene;
  nextSceneId: string | null;
  showArrivalExperience: boolean;
}

export interface SceneDirectorDependencies {
  repositories: EngineRepositories;
  videoGenerator: IVideoGenerator;
}

export class SceneDirector {
  constructor(private readonly dependencies: SceneDirectorDependencies) {}

  async locateTraveler(travelerId: string): Promise<TravelerLocation> {
    const traveler = await this.dependencies.repositories.travelers.findById(travelerId);
    if (!traveler) throw new Error(`Traveler ${travelerId} was not found.`);

    const journey = await this.dependencies.repositories.journeys.findActiveByTravelerId(travelerId);
    if (!journey) throw new Error(`Traveler ${travelerId} has no active journey.`);

    const activeJourney = journey.status === "not-started" ? startJourney(journey) : journey;
    if (activeJourney !== journey) {
      await this.dependencies.repositories.journeys.save(activeJourney);
    }

    const currentStep = getCurrentStep(activeJourney);
    if (!currentStep) throw new Error(`Journey ${activeJourney.id} has no current scene.`);

    const currentScene = await this.dependencies.repositories.scenes.loadById(currentStep.sceneId);
    if (!currentScene) throw new Error(`Scene ${currentStep.sceneId} could not be loaded.`);

    return {
      traveler,
      journey: activeJourney,
      currentScene,
      nextSceneId: getNextStep(activeJourney)?.sceneId ?? null,
      showArrivalExperience: shouldShowArrivalExperience(traveler)
    };
  }

  async acknowledgeArrival(travelerId: string): Promise<TravelerProfile> {
    const traveler = await this.dependencies.repositories.travelers.findById(travelerId);
    if (!traveler) throw new Error(`Traveler ${travelerId} was not found.`);

    const updated = markArrivalExperienceSeen(traveler);
    await this.dependencies.repositories.travelers.save(updated);
    return updated;
  }

  async queueScenePreview(travelerId: string): Promise<VideoJob> {
    const location = await this.locateTraveler(travelerId);
    const prompt = this.assemblePrompt(location.traveler, location.currentScene);

    return this.dependencies.videoGenerator.generatePreview({
      travelerId,
      sceneId: location.currentScene.definition.id,
      prompt,
      referenceImageUrl: location.traveler.profileImage ?? undefined,
      metadata: {
        journeyId: location.journey.id,
        membershipTier: location.traveler.membershipTier
      }
    });
  }

  async advanceTraveler(travelerId: string): Promise<TravelerLocation> {
    const location = await this.locateTraveler(travelerId);
    const advancedJourney = completeCurrentScene(location.journey);
    const nextStep = getCurrentStep(advancedJourney);

    const updatedTraveler: TravelerProfile = {
      ...location.traveler,
      currentScene: nextStep?.sceneId ?? location.traveler.currentScene,
      completedScenes: advancedJourney.completedSceneIds
    };

    await Promise.all([
      this.dependencies.repositories.journeys.save(advancedJourney),
      this.dependencies.repositories.travelers.save(updatedTraveler)
    ]);

    return this.locateTraveler(travelerId);
  }

  assemblePrompt(traveler: TravelerProfile, scene: LoadedScene): string {
    return [
      scene.prompt.trim(),
      `Traveler display name: ${traveler.displayName}.`,
      `Membership tier: ${traveler.membershipTier}.`,
      `Current world: ${traveler.currentWorld}.`,
      "Preserve the traveler’s identity, the scene’s atmosphere, and New Beansland continuity."
    ].join("\n\n");
  }
}
