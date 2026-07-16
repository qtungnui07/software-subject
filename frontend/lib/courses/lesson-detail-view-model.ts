import { getEnglishLessonDetail } from "@/data/courses/english-lesson-details";
import { getExercisesForLesson } from "@/lib/exercises/exercise-catalog";
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
};

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const getLockedReason = (
  nodeId: string,
  progress: CourseProgressState,
) => {
  const node = getLearningNodeById(nodeId);
  const section = getSectionForNode(nodeId);
  if (!node || !section) return null;

  if (!progress.unlockedSectionIds.includes(section.id)) {
    const course = getCourseById(section.courseId);
    const previousSection = course?.sections.find(
      (item) => item.order === section.order - 1,
    );
    return previousSection
      ? `Vượt qua checkpoint của “${previousSection.title}” để mở phần này.`
      : `Hoàn thành phần học trước để mở “${section.title}”.`;
  }

  if (!node.unlockAfterId) return "Bài học này hiện chưa sẵn sàng.";
  const prerequisite = getLearningNodeById(node.unlockAfterId);
  return prerequisite
    ? `Hoàn thành “${prerequisite.title}” để mở nội dung này.`
    : "Hoàn thành nội dung trước đó để mở bài học này.";
};

export const buildLessonDetailViewModel = (
  nodeId: string,
  progress: CourseProgressState,
): LessonDetailViewModel | null => {
  const node = getLearningNodeById(nodeId);
  const section = getSectionForNode(nodeId);
  const detail = getEnglishLessonDetail(nodeId);

  if (!node || !section || !detail || node.type === "chest") return null;

  const exercises = getExercisesForLesson(node.id);
  const access = getCourseNodeAccess(progress, node.id);
  const completed = progress.completedNodeIds.includes(node.id);
  const currentNodeId = getCurrentNodeIdForSection(progress, section.id);
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

  const actualSkills = unique(exercises.map((exercise) => exercise.skill));
  const focusSkills = unique([
    ...detail.focusSkills.filter((skill) => actualSkills.includes(skill)),
    ...actualSkills,
  ]);
  const exerciseTypes = unique(exercises.map((exercise) => exercise.type));

  return {
    nodeId: node.id,
    nodeType: node.type,
    title: node.title,
    shortTitle: node.shortTitle,
    description: node.description,
    overview: detail.overview,
    objectives: detail.objectives,
    focusSkills: focusSkills.map((id) => ({ id, label: skillLabels[id] })),
    exerciseTypes: exerciseTypes.map((id) => ({
      id,
      label: exerciseTypeLabels[id],
    })),
    exerciseCount: exercises.length,
    estimatedMinutes: detail.estimatedMinutes,
    xp: node.xp,
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
      : getLockedReason(node.id, progress),
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
