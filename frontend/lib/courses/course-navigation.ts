import { getCourseById, getSectionById } from "@/lib/courses/course-catalog";
import { getCurrentNodeIdForSection, type CourseProgressState } from "@/lib/courses/course-progress";

export const getContinueLearningTarget = (state: CourseProgressState) => {
  const section = getSectionById(state.currentSectionId);
  if (!section) return null;

  const nodeId = getCurrentNodeIdForSection(state, section.id);
  const node = section.chapter.nodes.find((item) => item.id === nodeId);

  return node?.href
    ? { sectionId: section.id, nodeId: node.id, href: node.href }
    : { sectionId: section.id, nodeId: node?.id ?? null, href: "/learn" };
};

export const getNextSectionId = (sectionId: string) => {
  const section = getSectionById(sectionId);
  if (!section) return null;

  const course = getCourseById(section.courseId);
  return course?.sections.find((item) => item.order === section.order + 1)?.id ?? null;
};
