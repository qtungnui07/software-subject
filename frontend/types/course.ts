export type CourseId = "english";

export type SectionLevel = "beginner" | "intermediate" | "advanced";

export type CourseContentStatus = "ready" | "placeholder";

export type LearningNodeType = "lesson" | "chest" | "checkpoint";

export type CourseRewardType = "streak_freeze";

export type CourseRewardIcon = "freeze";

export type CourseRewardDefinition = {
  type: CourseRewardType;
  amount: number;
  label: string;
  description: string;
  icon: CourseRewardIcon;
};

export type RoadmapPosition = {
  x: number;
  y: number;
};

export type LearningNodeDefinition = {
  id: string;
  legacyId?: number;
  type: LearningNodeType;
  title: string;
  shortTitle: string;
  description: string;
  order: number;
  unlockAfterId: string | null;
  href: string | null;
  xp: number;
  countsTowardProgress: boolean;
  contentStatus: CourseContentStatus;
  rewards?: CourseRewardDefinition[];
  roadmapPosition?: RoadmapPosition;
};

export type ChapterDefinition = {
  id: string;
  sectionId: string;
  order: number;
  title: string;
  description: string;
  nodes: LearningNodeDefinition[];
};

export type SectionDefinition = {
  id: string;
  courseId: CourseId;
  order: number;
  level: SectionLevel;
  title: string;
  description: string;
  contentStatus: CourseContentStatus;
  chapter: ChapterDefinition;
};

export type CourseDefinition = {
  id: CourseId;
  legacyIds: string[];
  languageCode: "en";
  title: string;
  imageSrc: string;
  sections: SectionDefinition[];
};
