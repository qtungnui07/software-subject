export type SectionPageStatus = "current" | "unlocked" | "completed" | "locked";

export type SectionPageItem = {
  id: string;
  order: number;
  title: string;
  description: string;
  chapterOrder: number;
  chapterTitle: string;
  chapterDescription: string;
  levelLabel: string;
  status: SectionPageStatus;
  current: boolean;
  unlocked: boolean;
  completed: boolean;
  recommended: boolean;
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
  checkpointScore: number | null;
  lockReason: string | null;
  actionLabel: string;
};
