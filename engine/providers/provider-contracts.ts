export type ProviderJobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface ProviderJob<TOutput = unknown> {
  id: string;
  provider: string;
  status: ProviderJobStatus;
  output?: TOutput;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIInstructionRequest {
  travelerId: string;
  sceneId: string;
  systemContext: string;
  storyContext: string;
  travelerContext: Record<string, unknown>;
}

export interface AIInstructionResult {
  dialogue: string[];
  environment: Record<string, unknown>;
  progressionNotes: string[];
  providerMetadata: Record<string, unknown>;
}

export interface IAIProvider {
  readonly name: string;
  createInstructions(request: AIInstructionRequest): Promise<AIInstructionResult>;
}

export interface VideoGenerationRequest {
  travelerId: string;
  sceneId: string;
  referenceImageUri: string;
  prompt: string;
  durationSeconds?: number;
  aspectRatio?: string;
  metadata?: Record<string, unknown>;
}

export interface VideoGenerationOutput {
  videoUri: string;
  previewUri?: string;
  downloadableUri?: string;
  metadata: Record<string, unknown>;
}

export interface IVideoProvider {
  readonly name: string;
  generateVideo(request: VideoGenerationRequest): Promise<ProviderJob<VideoGenerationOutput>>;
  generatePreview(request: VideoGenerationRequest): Promise<ProviderJob<VideoGenerationOutput>>;
  getStatus(jobId: string): Promise<ProviderJob<VideoGenerationOutput>>;
  cancelJob(jobId: string): Promise<ProviderJob<VideoGenerationOutput>>;
}
