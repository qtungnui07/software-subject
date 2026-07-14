"use client";

import { CourseRoadmap } from "@/components/learn/course-roadmap";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { SectionDefinition } from "@/types/course";

type Props = {
  section: SectionDefinition;
  progress: CourseProgressState;
  todayMinutes: number;
  onClaimReward?: (nodeId: string) => Promise<void> | void;
};

export const SectionLearningPath = ({
  section,
  progress,
  todayMinutes,
  onClaimReward,
}: Props) => {
  return (
    <CourseRoadmap
      section={section}
      progress={progress}
      todayMinutes={todayMinutes}
      onClaimReward={onClaimReward}
    />
  );
};
