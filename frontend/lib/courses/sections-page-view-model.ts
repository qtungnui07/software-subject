import { getCourseById } from "@/lib/courses/course-catalog";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { PlacementSectionId } from "@/types/placement-test";
import type { SectionPageItem } from "@/types/sections-page";
import type { CourseDefinition } from "@/types/course";

const levelLabels = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
} as const;

const percent = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

export const buildSectionsPageViewModels = (
  state: CourseProgressState,
  recommendedSectionId?: PlacementSectionId | null,
  contentCourse?: CourseDefinition,
): SectionPageItem[] => {
  const course = contentCourse
    ? getCourseById(contentCourse, state.courseId)
    : undefined;
  if (!course) return [];

  return course.sections.map((section, index) => {
    const requiredNodes = section.chapter.nodes.filter(
      (node) => node.countsTowardProgress,
    );
    const completedLessons = requiredNodes.filter((node) =>
      state.completedNodeIds.includes(node.id),
    ).length;
    const totalLessons = requiredNodes.length;
    const completed = totalLessons > 0 && completedLessons === totalLessons;
    const current = state.currentSectionId === section.id;
    const unlocked = state.unlockedSectionIds.includes(section.id);
    const recommended = recommendedSectionId === section.id;
    const checkpoint = requiredNodes.find((node) => node.type === "checkpoint");
    const checkpointScore = checkpoint
      ? state.checkpointScores[checkpoint.id] ?? null
      : null;
    const previousSection = course.sections[index - 1];
    const previousCheckpoint = previousSection?.chapter.nodes.find(
      (node) => node.type === "checkpoint",
    );
    const lockReason = unlocked
      ? null
      : previousSection && previousCheckpoint
        ? `Hoàn thành ${previousCheckpoint.title} của ${previousSection.title} để mở phần này.`
        : "Hoàn thành phần học trước để mở nội dung này.";
    const status: SectionPageItem["status"] = !unlocked
      ? "locked"
      : completed
        ? "completed"
        : current
          ? "current"
          : "unlocked";
    const actionLabel = !unlocked
      ? "CHƯA MỞ KHÓA"
      : completed
        ? "ÔN TẬP"
        : current
          ? "TIẾP TỤC"
          : "CHUYỂN ĐẾN PHẦN NÀY";

    return {
      id: section.id,
      order: section.order,
      title: section.title,
      description: section.description,
      chapterOrder: section.chapter.order,
      chapterTitle: section.chapter.title,
      chapterDescription: section.chapter.description,
      levelLabel: levelLabels[section.level],
      status,
      current,
      unlocked,
      completed,
      recommended,
      completedLessons,
      totalLessons,
      completionPercent: percent(completedLessons, totalLessons),
      checkpointScore,
      lockReason,
      actionLabel,
    };
  });
};
