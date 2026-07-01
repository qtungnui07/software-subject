import "server-only";

import { backendRequest } from "@/services/backend-client";

export type StudyTimeSummary = {
  userId: string;
  totalSeconds: number;
  todaySeconds: number;
  dailyGoalSeconds: number;
  currentDay: string;
  updatedAt: string;
};

export type StudyTimeResponse = {
  ok: true;
  summary: StudyTimeSummary;
};

export const getStudyTime = (userId: string) =>
  backendRequest<StudyTimeResponse>("/study-time", { userId });

export const trackStudyTime = (
  userId: string,
  input: { durationSeconds: number }
) =>
  backendRequest<StudyTimeResponse>("/study-time/track", {
    method: "POST",
    userId,
    body: input,
  });
