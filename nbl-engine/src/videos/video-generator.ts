export type VideoJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface GenerateVideoRequest {
  travelerId: string;
  sceneId: string;
  prompt: string;
  referenceImageUrl?: string;
  durationSeconds?: number;
  aspectRatio?: string;
  metadata?: Record<string, unknown>;
}

export interface VideoJob {
  id: string;
  provider: string;
  status: VideoJobStatus;
  outputUrl: string | null;
  previewUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IVideoGenerator {
  readonly providerName: string;
  generateVideo(request: GenerateVideoRequest): Promise<VideoJob>;
  generatePreview(request: GenerateVideoRequest): Promise<VideoJob>;
  getStatus(jobId: string): Promise<VideoJob>;
  cancelJob(jobId: string): Promise<VideoJob>;
}

export class PlaceholderVideoGenerator implements IVideoGenerator {
  readonly providerName = "placeholder";

  async generateVideo(request: GenerateVideoRequest): Promise<VideoJob> {
    return this.createQueuedJob(request, "video");
  }

  async generatePreview(request: GenerateVideoRequest): Promise<VideoJob> {
    return this.createQueuedJob(request, "preview");
  }

  async getStatus(jobId: string): Promise<VideoJob> {
    throw new Error(`Placeholder provider has no persisted job named ${jobId}.`);
  }

  async cancelJob(jobId: string): Promise<VideoJob> {
    const now = new Date().toISOString();
    return {
      id: jobId,
      provider: this.providerName,
      status: "cancelled",
      outputUrl: null,
      previewUrl: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now
    };
  }

  private createQueuedJob(
    request: GenerateVideoRequest,
    kind: "video" | "preview"
  ): VideoJob {
    const now = new Date().toISOString();
    return {
      id: `${kind}-${request.travelerId}-${request.sceneId}-${Date.now()}`,
      provider: this.providerName,
      status: "queued",
      outputUrl: null,
      previewUrl: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now
    };
  }
}
