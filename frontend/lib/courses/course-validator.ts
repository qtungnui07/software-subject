import type { CourseDefinition } from "@/types/course";

export type CourseValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

const hasContiguousOrders = (orders: number[]) => {
  const sortedOrders = [...orders].sort((a, b) => a - b);

  return sortedOrders.every((order, index) => order === index + 1);
};

export const validateCourseDefinition = (
  course: CourseDefinition
): CourseValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sectionIds = new Set<string>();
  const chapterIds = new Set<string>();
  const globalNodeIds = new Set<string>();

  if (!course.id.trim()) errors.push("Course id is required.");
  if (!course.title.trim()) errors.push("Course title is required.");
  if (course.sections.length === 0) errors.push("Course needs at least one section.");

  if (!hasContiguousOrders(course.sections.map((section) => section.order))) {
    errors.push("Section orders must be contiguous and start at 1.");
  }

  for (const section of course.sections) {
    if (sectionIds.has(section.id)) {
      errors.push(`Duplicate section id: ${section.id}`);
    }
    sectionIds.add(section.id);

    if (section.courseId !== course.id) {
      errors.push(`Section ${section.id} points to the wrong course id.`);
    }

    if (!section.title.trim()) {
      errors.push(`Section ${section.id} needs a title.`);
    }

    const chapter = section.chapter;

    if (chapterIds.has(chapter.id)) {
      errors.push(`Duplicate chapter id: ${chapter.id}`);
    }
    chapterIds.add(chapter.id);

    if (chapter.sectionId !== section.id) {
      errors.push(`Chapter ${chapter.id} points to the wrong section id.`);
    }

    if (chapter.order !== 1) {
      errors.push(`Chapter ${chapter.id} must have order 1 in the MVP.`);
    }

    if (chapter.nodes.length === 0) {
      errors.push(`Chapter ${chapter.id} needs at least one node.`);
      continue;
    }

    if (!hasContiguousOrders(chapter.nodes.map((node) => node.order))) {
      errors.push(`Node orders in ${chapter.id} must be contiguous and start at 1.`);
    }

    const localNodeIds = new Set(chapter.nodes.map((node) => node.id));
    const checkpointCount = chapter.nodes.filter(
      (node) => node.type === "checkpoint"
    ).length;

    if (checkpointCount !== 1) {
      errors.push(`Chapter ${chapter.id} must contain exactly one checkpoint.`);
    }

    const sortedNodes = [...chapter.nodes].sort((a, b) => a.order - b.order);

    sortedNodes.forEach((node, index) => {
      if (globalNodeIds.has(node.id)) {
        errors.push(`Duplicate learning node id: ${node.id}`);
      }
      globalNodeIds.add(node.id);

      if (!node.title.trim()) {
        errors.push(`Node ${node.id} needs a title.`);
      }

      if (node.xp < 0) {
        errors.push(`Node ${node.id} cannot have negative XP.`);
      }

      if (index === 0 && node.unlockAfterId !== null) {
        errors.push(`First node ${node.id} must not have an unlock dependency.`);
      }

      if (node.unlockAfterId !== null) {
        if (!localNodeIds.has(node.unlockAfterId)) {
          errors.push(
            `Node ${node.id} depends on missing node ${node.unlockAfterId}.`
          );
        } else {
          const dependency = chapter.nodes.find(
            (item) => item.id === node.unlockAfterId
          );

          if (dependency && dependency.order >= node.order) {
            errors.push(
              `Node ${node.id} must depend on an earlier node, not ${node.unlockAfterId}.`
            );
          }
        }
      }

      if (node.contentStatus === "placeholder" && node.href) {
        warnings.push(
          `Placeholder node ${node.id} already has a route: ${node.href}.`
        );
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};
