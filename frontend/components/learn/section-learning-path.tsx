"use client";

import { CourseRoadmap } from "@/components/learn/course-roadmap";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { CourseDefinition, SectionDefinition } from "@/types/course";

type Props = {
  course: CourseDefinition;
  section: SectionDefinition;
  progress: CourseProgressState;
  todayMinutes: number;
  onClaimReward?: (nodeId: string) => Promise<void> | void;
};

export const SectionLearningPath = ({
  course,
  section,
  progress,
  todayMinutes,
  onClaimReward,
}: Props) => {
  return (
    <CourseRoadmap
      course={course}
      section={section}
      progress={progress}
      todayMinutes={todayMinutes}
      onClaimReward={onClaimReward}
    />
  );
};
