import {
  CHAPTER_ONE_MAIN_PROGRESS_TOTAL,
  chapterOneDemoScope,
  chapterOneNodes,
  getChapterOneNodeById,
  getChapterOneNodeByLegacyId,
  type ChapterOneNodeType,
} from "@/constants/chapter-one";

export type LessonStatus = "completed" | "current" | "locked" | "reward" | "checkpoint";

export type LessonNode = {
  /** Legacy numeric id kept for existing pages such as /lesson/[lessonId]. */
  id: number;
  /** Stable string id for the normalized Chapter 1 demo flow. */
  nodeId: string;
  type: ChapterOneNodeType;
  title: string;
  shortTitle: string;
  description: string;
  status: LessonStatus;
  progress?: number;
  xp: number;
  href: string | null;
  unlockAfterId: string | null;
  countsTowardProgress: boolean;
  x: number;
  y: number;
};

const getInitialLessonStatus = (node: (typeof chapterOneNodes)[number]): LessonStatus => {
  if (node.type === "chest") return "reward";
  if (node.type === "checkpoint") return "checkpoint";

  return node.initialStatus;
};

export const lessonNodes: LessonNode[] = chapterOneNodes.map((node) => ({
  id: node.legacyId,
  nodeId: node.id,
  type: node.type,
  title: node.title,
  shortTitle: node.shortTitle,
  description: node.description,
  status: getInitialLessonStatus(node),
  progress: node.initialStatus === "current" ? 0 : undefined,
  xp: node.xp,
  href: node.href,
  unlockAfterId: node.unlockAfterId,
  countsTowardProgress: node.countsTowardProgress,
  x: node.x,
  y: node.y,
}));

export {
  CHAPTER_ONE_MAIN_PROGRESS_TOTAL,
  chapterOneDemoScope,
  chapterOneNodes,
  getChapterOneNodeById,
  getChapterOneNodeByLegacyId,
};
