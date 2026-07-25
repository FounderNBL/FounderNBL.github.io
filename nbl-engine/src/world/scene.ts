export interface SceneAssetReference {
  id: string;
  type: "image" | "audio" | "video" | "model" | "text";
  path: string;
  required: boolean;
}

export interface SceneTransition {
  destinationSceneId: string;
  condition?: string;
  label?: string;
}

export interface SceneDefinition {
  id: string;
  worldId: string;
  title: string;
  version: number;
  description: string;
  promptFile: string;
  cameraFile: string;
  lightingFile: string;
  musicFile: string;
  introFile: string;
  assets: SceneAssetReference[];
  transitions: SceneTransition[];
  membershipTiers: string[];
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface LoadedScene {
  definition: SceneDefinition;
  prompt: string;
  camera: Record<string, unknown>;
  lighting: Record<string, unknown>;
  music: Record<string, unknown>;
  intro: Record<string, unknown>;
}

export function validateSceneDefinition(scene: SceneDefinition): void {
  if (!scene.id.trim()) throw new Error("Scene id is required.");
  if (!scene.worldId.trim()) throw new Error("Scene worldId is required.");
  if (!scene.title.trim()) throw new Error("Scene title is required.");
  if (!Number.isInteger(scene.version) || scene.version < 1) {
    throw new Error("Scene version must be a positive integer.");
  }

  const requiredFiles = [
    scene.promptFile,
    scene.cameraFile,
    scene.lightingFile,
    scene.musicFile,
    scene.introFile
  ];
  if (requiredFiles.some((file) => !file.trim())) {
    throw new Error(`Scene ${scene.id} is missing a configuration file reference.`);
  }
}
