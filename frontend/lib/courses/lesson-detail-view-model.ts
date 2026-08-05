import {
  getCourseById,
  getLearningNodeById,
  getSectionForNode,
} from "@/lib/courses/course-catalog";
import { getCourseNodeAccess } from "@/lib/courses/course-access";
import { getCurrentNodeIdForSection } from "@/lib/courses/course-progress";
import { CHECKPOINT_UNLOCK_THRESHOLD } from "@/lib/courses/course-unlock-policy";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { ExerciseSkill, ExerciseType } from "@/types/exercise";
import type { LessonDetailViewModel } from "@/types/lesson-detail";
import type { CourseDefinition } from "@/types/course";

const skillLabels: Record<ExerciseSkill, string> = {
  vocabulary: "Từ vựng",
  grammar: "Ngữ pháp",
  listening: "Nghe",
  reading: "Đọc hiểu",
  conversation: "Giao tiếp",
};

const exerciseTypeLabels: Record<ExerciseType, string> = {
  multiple_choice: "Chọn đáp án",
  arrange_words: "Sắp xếp câu",
  fill_blank: "Điền từ",
  dialogue_choice: "Hội thoại",
  listening_choice: "Nghe hiểu",
  match_pairs: "Nối thông tin",
  arrange_dialogue: "Sắp xếp hội thoại",
  sentence_rewrite: "Viết lại câu",
  short_writing: "Viết ngắn",
};

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const getLockedReason = (
  nodeId: string,
  progress: CourseProgressState,
  course: CourseDefinition,
) => {
  const node = getLearningNodeById(course, nodeId);
  const section = getSectionForNode(course, nodeId);
  if (!node || !section) return null;

  if (!progress.unlockedSectionIds.includes(section.id)) {
    const resolvedCourse = getCourseById(course, section.courseId);
    const previousSection = resolvedCourse?.sections.find(
      (item) => item.order === section.order - 1,
    );
    return previousSection
      ? `Vượt qua checkpoint của “${previousSection.title}” để mở phần này.`
      : `Hoàn thành phần học trước để mở “${section.title}”.`;
  }

  if (!node.unlockAfterId) return "Bài học này hiện chưa sẵn sàng.";
  const prerequisite = getLearningNodeById(course, node.unlockAfterId);
  return prerequisite
    ? `Hoàn thành “${prerequisite.title}” để mở nội dung này.`
    : "Hoàn thành nội dung trước đó để mở bài học này.";
};

export const buildLessonDetailViewModel = (
  nodeId: string,
  progress: CourseProgressState,
  course: CourseDefinition,
  remoteContent: {
    title: string;
    shortTitle: string;
    description: string;
    xp: number;
    detail: {
      overview: string;
      objectives: string[];
      focusSkills: ExerciseSkill[];
      estimatedMinutes: number;
      checkpointUnlocks?: string;
    } | null;
    exerciseSummary: {
      count: number;
      types: ExerciseType[];
      skills: ExerciseSkill[];
    };
  },
): LessonDetailViewModel | null => {
  const node = getLearningNodeById(course, nodeId);
  const section = getSectionForNode(course, nodeId);
  const detail = remoteContent.detail;

  if (!node || !section || !detail || node.type === "chest") return null;

  const access = getCourseNodeAccess(progress, node.id, course);
  const completed = progress.completedNodeIds.includes(node.id);
  const currentNodeId = getCurrentNodeIdForSection(
    progress,
    section.id,
    course,
  );
  const isCheckpoint = node.type === "checkpoint";
  const bestCheckpointScore = isCheckpoint
    ? (progress.checkpointScores[node.id] ?? null)
    : null;
  const checkpointPassed =
    bestCheckpointScore !== null &&
    bestCheckpointScore >= CHECKPOINT_UNLOCK_THRESHOLD;

  const status = !access.allowed
    ? "locked"
    : completed
      ? "completed"
      : currentNodeId === node.id
        ? "current"
        : "ready";

  const statusLabel =
    status === "locked"
      ? "Chưa mở khóa"
      : status === "completed"
        ? isCheckpoint
          ? "Đã vượt qua"
          : "Đã hoàn thành"
        : status === "current"
          ? isCheckpoint
            ? "Checkpoint hiện tại"
            : "Bài hiện tại"
          : "Sẵn sàng học";

  const statusDescription =
    status === "locked"
      ? "Bạn có thể xem trước nội dung, nhưng chưa thể bắt đầu bài học này."
      : status === "completed"
        ? isCheckpoint
          ? "Bạn đã vượt qua checkpoint và có thể làm lại để cải thiện điểm cao nhất."
          : "Bạn đã hoàn thành bài học và có thể ôn tập lại bất cứ lúc nào."
        : isCheckpoint
          ? "Hoàn thành bài kiểm tra để xác nhận kiến thức của phần học này."
          : "Bài học đã sẵn sàng. Hãy bắt đầu khi bạn muốn tiếp tục lộ trình.";

  const actionLabel =
    status === "locked"
      ? "Chưa mở khóa"
      : isCheckpoint
        ? bestCheckpointScore !== null
          ? "Làm lại checkpoint"
          : "Bắt đầu kiểm tra"
        : status === "completed"
          ? "Ôn tập lại"
          : status === "current"
            ? "Tiếp tục học"
            : "Bắt đầu học";

  const actualSkills = unique(remoteContent.exerciseSummary.skills);
  const focusSkills = unique([
    ...detail.focusSkills.filter((skill) => actualSkills.includes(skill)),
    ...actualSkills,
  ]);
  const exerciseTypes = unique(remoteContent.exerciseSummary.types);

  return {
    nodeId: node.id,
    nodeType: node.type,
    title: remoteContent.title,
    shortTitle: remoteContent.shortTitle,
    description: remoteContent.description,
    overview: detail.overview,
    objectives: detail.objectives,
    focusSkills: focusSkills.map((id) => ({ id, label: skillLabels[id] })),
    exerciseTypes: exerciseTypes.map((id) => ({
      id,
      label: exerciseTypeLabels[id],
    })),
    exerciseCount: remoteContent.exerciseSummary.count,
    estimatedMinutes: detail.estimatedMinutes,
    xp: remoteContent.xp,
    section: {
      id: section.id,
      order: section.order,
      title: section.title,
    },
    chapter: {
      id: section.chapter.id,
      order: section.chapter.order,
      title: section.chapter.title,
    },
    status,
    statusLabel,
    statusDescription,
    actionLabel,
    playerHref: access.allowed
      ? `/lesson?id=${encodeURIComponent(node.id)}`
      : null,
    lockedReason: access.allowed
      ? null
      : getLockedReason(node.id, progress, course),
    checkpoint: isCheckpoint
      ? {
          passingScore: CHECKPOINT_UNLOCK_THRESHOLD,
          bestScore: bestCheckpointScore,
          passed: checkpointPassed,
          unlocksLabel: detail.checkpointUnlocks ?? null,
        }
      : null,
  };
};
