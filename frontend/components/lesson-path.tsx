"use client";

import { CourseRoadmap } from "@/components/learn/course-roadmap";
import { englishCourse } from "@/data/courses/english-course";
import { migrateChapterOneProgressToCourseProgress } from "@/lib/courses/chapter-one-adapter";
import type { ChapterOneProgressState } from "@/lib/chapter-one-progress";

const sectionOne = englishCourse.sections[0];

type Props = {
  todayMinutes: number;
  progressState: ChapterOneProgressState;
  onClaimChest?: (chestId: string) => void | Promise<void>;
};

export const LessonPath = ({
  todayMinutes,
  progressState,
  onClaimChest,
}: Props) => {
  const progress = migrateChapterOneProgressToCourseProgress(progressState);

  return (
    <CourseRoadmap
      section={sectionOne}
      progress={progress}
      todayMinutes={todayMinutes}
      onClaimReward={onClaimChest}
    />
  );
};
