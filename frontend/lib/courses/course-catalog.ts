import { englishCourse } from "@/data/courses/english-course";
import type {
  ChapterDefinition,
  CourseDefinition,
  CourseId,
  LearningNodeDefinition,
  SectionDefinition,
} from "@/types/course";

export const courseCatalog: CourseDefinition[] = [englishCourse];

const resolveCourse = (courseId: string) => {
  return courseCatalog.find(
    (course) => course.id === courseId || course.legacyIds.includes(courseId)
  );
};

export const getCourseById = (
  courseId: CourseId | string
): CourseDefinition | undefined => {
  return resolveCourse(courseId);
};

export const getSectionById = (
  sectionId: string
): SectionDefinition | undefined => {
  for (const course of courseCatalog) {
    const section = course.sections.find((item) => item.id === sectionId);
    if (section) return section;
  }

  return undefined;
};

export const getChapterById = (
  chapterId: string
): ChapterDefinition | undefined => {
  for (const course of courseCatalog) {
    const section = course.sections.find(
      (item) => item.chapter.id === chapterId
    );
    if (section) return section.chapter;
  }

  return undefined;
};

export const getLearningNodeById = (
  nodeId: string
): LearningNodeDefinition | undefined => {
  for (const course of courseCatalog) {
    for (const section of course.sections) {
      const node = section.chapter.nodes.find((item) => item.id === nodeId);
      if (node) return node;
    }
  }

  return undefined;
};


export const getSectionForNode = (
  nodeId: string
): SectionDefinition | undefined => {
  for (const course of courseCatalog) {
    for (const section of course.sections) {
      if (section.chapter.nodes.some((item) => item.id === nodeId)) {
        return section;
      }
    }
  }

  return undefined;
};

export const getCourseNodes = (courseId: CourseId | string) => {
  const course = getCourseById(courseId);

  return (
    course?.sections.flatMap((section) => section.chapter.nodes) ?? []
  );
};
