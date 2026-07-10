import { getCourseById, getSectionById } from "@/lib/courses/course-catalog";
import type { CourseProgressState } from "@/lib/courses/course-progress";

export const getLearningProfileStats = (progress: CourseProgressState) => {
  const course = getCourseById(progress.courseId);
  const learningNodes =
    course?.sections.flatMap((section) =>
      section.chapter.nodes.filter((node) => node.type !== "chest"),
    ) ?? [];
  const learningNodeIds = new Set(learningNodes.map((node) => node.id));
  const completedLearningNodes = progress.completedNodeIds.filter((nodeId) =>
    learningNodeIds.has(nodeId),
  ).length;
  const totalLearningNodes = learningNodes.length;
  const completionPercent =
    totalLearningNodes === 0
      ? 0
      : Math.round((completedLearningNodes / totalLearningNodes) * 100);
  const currentSection = getSectionById(progress.currentSectionId);

  return {
    completedLearningNodes,
    totalLearningNodes,
    completionPercent,
    currentSectionId: progress.currentSectionId,
    currentSectionTitle: currentSection?.title ?? "Phần 1: Nền tảng",
    unlockedSections: progress.unlockedSectionIds.length,
  };
};
