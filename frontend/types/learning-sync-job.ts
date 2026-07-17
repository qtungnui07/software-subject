export type LearningSyncSystem = "xp" | "quest" | "streak";
export type LearningSyncJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type LearningSyncJobPayload = {
  userName?: string | null;
  userImageSrc?: string | null;
  accuracy: number;
  durationSeconds: number;
  afkCount: number;
  completedLessons: number;
  earnedXp: number;
};

export type LearningSyncJobRecord = {
  id: number;
  userId: string;
  nodeId: string;
  system: LearningSyncSystem;
  status: LearningSyncJobStatus;
  attempts: number;
  nextRetryAt: Date;
  payloadJson: string;
  lastErrorCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
};
