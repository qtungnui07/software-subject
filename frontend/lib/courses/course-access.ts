import { getLearningNodeById, getSectionForNode } from "@/lib/courses/course-catalog";
import { canAccessCourseNode, isSectionUnlocked } from "@/lib/courses/course-unlock-policy";
import type { CourseProgressState } from "@/lib/courses/course-progress";

export const getSectionIdForNode = (nodeId: string) => {
  return getSectionForNode(nodeId)?.id ?? null;
};

export const getCourseNodeAccess = (
  state: CourseProgressState,
  nodeId: string
) => {
  const node = getLearningNodeById(nodeId);
  const sectionId = getSectionIdForNode(nodeId);
  const section = getSectionForNode(nodeId);

  if (!node || !section) {
    return { allowed: false, reason: "not-found" as const, sectionId };
  }
  if (!isSectionUnlocked(state, section.id)) {
    return { allowed: false, reason: "locked-section" as const, sectionId: section.id };
  }
  if (!canAccessCourseNode(state, node.id)) {
    return { allowed: false, reason: "locked-node" as const, sectionId: section.id };
  }

  return { allowed: true, reason: "allowed" as const, sectionId: section.id };
};
