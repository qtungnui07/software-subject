import type { ExerciseSkill, ExerciseType } from "@/types/exercise";

export type LessonDetailContent = {
  nodeId: string;
  overview: string;
  objectives: string[];
  focusSkills: ExerciseSkill[];
  estimatedMinutes: number;
  checkpointUnlocks?: string;
};

export type LessonDetailStatus =
  | "locked"
  | "ready"
  | "current"
  | "completed";

export type LessonDetailViewModel = {
  nodeId: string;
  nodeType: "lesson" | "checkpoint";
  title: string;
  shortTitle: string;
  description: string;
  overview: string;
  objectives: string[];
  focusSkills: Array<{
    id: ExerciseSkill;
    label: string;
  }>;
  exerciseTypes: Array<{
    id: ExerciseType;
    label: string;
  }>;
  exerciseCount: number;
  estimatedMinutes: number;
  xp: number;
  section: {
    id: string;
    order: number;
    title: string;
  };
  chapter: {
    id: string;
    order: number;
    title: string;
  };
  status: LessonDetailStatus;
  statusLabel: string;
  statusDescription: string;
  actionLabel: string;
  playerHref: string | null;
  lockedReason: string | null;
  checkpoint: {
    passingScore: number;
    bestScore: number | null;
    passed: boolean;
    unlocksLabel: string | null;
  } | null;
};
