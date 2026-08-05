import type {
  ChapterDefinition,
  CourseDefinition,
  CourseId,
  LearningNodeDefinition,
  SectionDefinition,
} from "@/types/course";

export const getCourseById = (
  course: CourseDefinition,
  courseId: CourseId | string
): CourseDefinition | undefined => {
  return course.id === courseId || course.legacyIds.includes(courseId)
    ? course
    : undefined;
};

export const getSectionById = (
  course: CourseDefinition,
  sectionId: string
): SectionDefinition | undefined => {
  return course.sections.find((item) => item.id === sectionId);
};

export const getChapterById = (
  course: CourseDefinition,
  chapterId: string
): ChapterDefinition | undefined => {
  return course.sections.find((item) => item.chapter.id === chapterId)?.chapter;
};

export const getLearningNodeById = (
  course: CourseDefinition,
  nodeId: string
): LearningNodeDefinition | undefined => {
  for (const section of course.sections) {
    const node = section.chapter.nodes.find(
      (item) =>
        item.id === nodeId ||
        (item.legacyId !== undefined && String(item.legacyId) === nodeId),
    );
    if (node) return node;
  }

  return undefined;
};


export const getSectionForNode = (
  course: CourseDefinition,
  nodeId: string
): SectionDefinition | undefined => {
  for (const section of course.sections) {
    if (
      section.chapter.nodes.some(
        (item) =>
          item.id === nodeId ||
          (item.legacyId !== undefined && String(item.legacyId) === nodeId),
      )
    ) {
      return section;
    }
  }

  return undefined;
};

export const getCourseNodes = (
  course: CourseDefinition,
  courseId: CourseId | string,
) => {
  const resolvedCourse = getCourseById(course, courseId);

  return (
    resolvedCourse?.sections.flatMap((section) => section.chapter.nodes) ?? []
  );
};
