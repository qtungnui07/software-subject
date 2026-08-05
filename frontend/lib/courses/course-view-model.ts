import { getCourseById } from "@/lib/courses/course-catalog";
import { CHECKPOINT_UNLOCK_THRESHOLD } from "@/lib/courses/course-unlock-policy";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { PlacementSectionId } from "@/types/placement-test";
import type { CourseDefinition } from "@/types/course";

export type SectionViewStatus = "locked" | "available" | "current" | "completed" | "recommended";

export const buildCourseSectionViewModels = (
  state: CourseProgressState,
  contentCourse: CourseDefinition,
  recommendedSectionId?: PlacementSectionId | null
) => {
  const course = getCourseById(contentCourse, state.courseId);

  return (course?.sections ?? []).map((section) => {
    const checkpoint = section.chapter.nodes.find((node) => node.type === "checkpoint");
    const checkpointScore = checkpoint ? state.checkpointScores[checkpoint.id] ?? 0 : 0;
    const unlocked = state.unlockedSectionIds.includes(section.id);
    const completed = checkpointScore >= CHECKPOINT_UNLOCK_THRESHOLD;
    const current = state.currentSectionId === section.id;
    const recommended = recommendedSectionId === section.id;
    const status: SectionViewStatus = !unlocked
      ? "locked"
      : completed
        ? "completed"
        : current
          ? "current"
          : recommended
            ? "recommended"
            : "available";

    return {
      id: section.id,
      order: section.order,
      title: section.title,
      description: section.description,
      chapterTitle: section.chapter.title,
      status,
      unlocked,
      completed,
      current,
      recommended,
      checkpointScore,
    };
  });
};
