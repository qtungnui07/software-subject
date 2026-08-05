import { getLearningNodeById, getSectionForNode } from "@/lib/courses/course-catalog";
import { canAccessCourseNode, isSectionUnlocked } from "@/lib/courses/course-unlock-policy";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { CourseDefinition } from "@/types/course";

export const getSectionIdForNode = (
  nodeId: string,
  course: CourseDefinition,
) => {
  return getSectionForNode(course, nodeId)?.id ?? null;
};

export const getCourseNodeAccess = (
  state: CourseProgressState,
  nodeId: string,
  course: CourseDefinition,
) => {
  const node = getLearningNodeById(course, nodeId);
  const sectionId = getSectionIdForNode(nodeId, course);
  const section = getSectionForNode(course, nodeId);

  if (!node || !section) {
    return { allowed: false, reason: "not-found" as const, sectionId };
  }
  if (!isSectionUnlocked(state, section.id)) {
    return { allowed: false, reason: "locked-section" as const, sectionId: section.id };
  }
  if (!canAccessCourseNode(state, node.id, course)) {
    return { allowed: false, reason: "locked-node" as const, sectionId: section.id };
  }

  return { allowed: true, reason: "allowed" as const, sectionId: section.id };
};
