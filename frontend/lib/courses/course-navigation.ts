import { getCourseById, getSectionById } from "@/lib/courses/course-catalog";
import { getCurrentNodeIdForSection, type CourseProgressState } from "@/lib/courses/course-progress";
import type { CourseDefinition } from "@/types/course";

export const getContinueLearningTarget = (
  state: CourseProgressState,
  course: CourseDefinition,
) => {
  const section = getSectionById(course, state.currentSectionId);
  if (!section) return null;

  const nodeId = getCurrentNodeIdForSection(state, section.id, course);
  const node = section.chapter.nodes.find((item) => item.id === nodeId);

  return node?.href
    ? { sectionId: section.id, nodeId: node.id, href: node.href }
    : { sectionId: section.id, nodeId: node?.id ?? null, href: "/learn" };
};

export const getNextSectionId = (
  sectionId: string,
  course: CourseDefinition,
) => {
  const section = getSectionById(course, sectionId);
  if (!section) return null;

  const resolvedCourse = getCourseById(course, section.courseId);
  return resolvedCourse?.sections.find(
    (item) => item.order === section.order + 1,
  )?.id ?? null;
};
