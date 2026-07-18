"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { RefreshCw, Home, Heart } from "lucide-react";

import { LessonHeader } from "@/components/lesson-header";
import { ExitModal } from "@/components/exit-modal";
import {
  LessonStudyTimer,
  type LessonStudyTimerHandle,
} from "@/components/lesson-study-timer";
import { LessonResultScreen } from "@/components/lesson-result-screen";
import { Button } from "@/components/ui/button";
import { lessonNodes } from "@/constants/lessons";
import {
  saveChapterOneProgress,
  setChapterOneProgressOwner,
} from "@/lib/chapter-one-progress";
import { StreakNotification } from "@/components/streak/streak-notification";
import type { StreakNotificationInput } from "@/components/streak/streak-data";
import { STREAK_UPDATED_EVENT } from "@/components/streak/use-streak";
import { ExerciseFeedback } from "@/components/lesson/exercise-feedback";
import { ResumeSessionDialog } from "@/components/lesson/resume-session-dialog";
import { SessionSaveStatus } from "@/components/lesson/session-save-status";
import { SilentModeToggle } from "@/components/lesson/silent-mode-toggle";
import { ExerciseRenderer } from "@/components/lesson/exercise-renderer";
import {
  checkExerciseAnswer,
  isExerciseAnswerComplete,
} from "@/lib/exercises/check-exercise-answer";
import { getExercisesForLesson } from "@/lib/exercises/exercise-catalog";
import {
  canRetryExerciseAttempt,
  recordExerciseAttempt,
} from "@/lib/exercises/exercise-attempt";
import { buildLessonScoreSummary } from "@/lib/exercises/lesson-score-summary";
import {
  createMistakeReviewQueue,
  getCorrectMatchPairLeftIds,
} from "@/lib/exercises/mistake-review";
import { getLearningNodeById } from "@/lib/courses/course-catalog";
import { useLearningSessionDraft } from "@/hooks/use-learning-session-draft";
import { createExerciseCatalogFingerprint } from "@/lib/learning-session/draft-fingerprint";
import { getLearningSessionDraftKey } from "@/lib/learning-session/draft-storage";
import { validateLearningSessionDraft } from "@/lib/learning-session/draft-validator";
import { getCourseNodeAccess } from "@/lib/courses/course-access";
import { projectCourseProgressToChapterOne } from "@/lib/courses/chapter-one-adapter";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { ExerciseAnswer, ExerciseCheckResult } from "@/types/exercise";
import type { ExerciseAttemptResult } from "@/types/lesson-session";
import type { LearningCompletionResult } from "@/types/learning-completion";
import type {
  AssessmentMode,
  LessonSessionDraft,
} from "@/types/learning-session-draft";

const LESSON_PASS_THRESHOLD = 60;
const CHECKPOINT_PASS_THRESHOLD = 70;

type ResolvedLessonNode = {
  nodeId: string;
  type: "lesson" | "chest" | "checkpoint";
  title: string;
  xp: number;
};

type PlayableLessonNode = Omit<ResolvedLessonNode, "type"> & {
  type: "lesson" | "checkpoint";
};

const isPlayableLessonNode = (
  node: ResolvedLessonNode | null | undefined,
): node is PlayableLessonNode =>
  node?.type === "lesson" || node?.type === "checkpoint";

type CourseProgressApiResult = {
  success: boolean;
  user: { id: string };
  progress: CourseProgressState;
};

const LessonContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawLessonId = searchParams.get("id") || "lesson-1";
  const legacyLessonId = Number.parseInt(rawLessonId, 10);

  // Resolve both the legacy Chapter 1 nodes and the new Section 2-3 nodes.
  // Numeric ids remain supported for old links, while unknown ids no longer
  // silently open lesson-1.
  const legacyRequestedNode =
    lessonNodes.find((node) => node.nodeId === rawLessonId) ||
    lessonNodes.find((node) => node.id === legacyLessonId);
  const catalogRequestedNode = getLearningNodeById(rawLessonId);
  const requestedNode: ResolvedLessonNode | undefined = legacyRequestedNode
    ? {
        nodeId: legacyRequestedNode.nodeId,
        type: legacyRequestedNode.type,
        title: legacyRequestedNode.title,
        xp: legacyRequestedNode.xp,
      }
    : catalogRequestedNode
      ? {
          nodeId: catalogRequestedNode.id,
          type: catalogRequestedNode.type,
          title: catalogRequestedNode.title,
          xp: catalogRequestedNode.xp,
        }
      : undefined;
  const shouldRedirectToLearn = requestedNode?.type === "chest";
  const checkpointRedirectId =
    requestedNode?.type === "checkpoint" ? requestedNode.nodeId : null;
  const shouldRedirectToCheckpoint = Boolean(checkpointRedirectId);
  const hasKnownLessonNode = Boolean(requestedNode);
  const lessonNode: PlayableLessonNode = isPlayableLessonNode(requestedNode)
    ? requestedNode
    : {
        nodeId: rawLessonId,
        type: "lesson",
        title: "Bài học không tồn tại",
        xp: 0,
      };
  const isChapterOneNode = lessonNodes.some(
    (node) => node.nodeId === lessonNode.nodeId,
  );

  useEffect(() => {
    if (shouldRedirectToLearn) {
      router.replace("/learn");
      return;
    }

    if (checkpointRedirectId) {
      router.replace(`/checkpoint/${checkpointRedirectId}`);
    }
  }, [checkpointRedirectId, router, shouldRedirectToLearn]);

  // Exercise engine states. The completion/XP flow below remains unchanged.
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [assessmentMode, setAssessmentMode] =
    useState<AssessmentMode>("standard");
  const [preferredAssessmentMode, setPreferredAssessmentMode] =
    useState<AssessmentMode>("standard");
  const [resumeDraft, setResumeDraft] = useState<LessonSessionDraft | null>(
    null,
  );
  const [draftChecked, setDraftChecked] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [afkCount, setAfkCount] = useState(0);
  const [exerciseAnswer, setExerciseAnswer] = useState<ExerciseAnswer | null>(
    null,
  );
  const [checkResult, setCheckResult] = useState<ExerciseCheckResult | null>(
    null,
  );
  const [hearts, setHearts] = useState(5);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [attemptResults, setAttemptResults] = useState<
    Record<string, ExerciseAttemptResult>
  >({});
  const [lockedMatchPairLeftIds, setLockedMatchPairLeftIds] = useState<
    string[]
  >([]);
  const [isRetryAttempt, setIsRetryAttempt] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewExerciseIds, setReviewExerciseIds] = useState<string[]>([]);
  const [reviewExerciseIndex, setReviewExerciseIndex] = useState(0);
  const [reviewResults, setReviewResults] = useState<
    Record<string, { exerciseId: string; recovered: boolean }>
  >({});

  // XP + Streak states
  const [xpResult, setXpResult] = useState<
    LearningCompletionResult["xp"] | null
  >(null);
  const [isClaimingXp, setIsClaimingXp] = useState(false);
  const [xpError, setXpError] = useState<string | null>(null);
  const [streakResult, setStreakResult] =
    useState<StreakNotificationInput | null>(null);
  const [completionBlockedMessage, setCompletionBlockedMessage] = useState<
    string | null
  >(null);
  const [courseProgressMessage, setCourseProgressMessage] = useState<
    string | null
  >(null);
  const [isProgressReady, setIsProgressReady] = useState(false);
  const [accessState, setAccessState] = useState<
    "loading" | "allowed" | "redirecting"
  >("loading");
  const hasHandledCompletionRef = useRef(false);
  const completionIdempotencyKeyRef = useRef<string | null>(null);
  const studyDurationSecondsRef = useRef(0);
  const studyTimerRef = useRef<LessonStudyTimerHandle | null>(null);

  const exercises = useMemo(
    () => getExercisesForLesson(lessonNode.nodeId),
    [lessonNode.nodeId],
  );
  const catalogFingerprint = useMemo(
    () => createExerciseCatalogFingerprint(exercises),
    [exercises],
  );
  const draftContentVersion = Math.max(
    1,
    ...exercises.map((exercise) => exercise.contentVersion ?? 1),
  );
  const draftStorageKey = useMemo(
    () =>
      currentUserId
        ? getLearningSessionDraftKey({
            kind: "lesson",
            userId: currentUserId,
            contentId: lessonNode.nodeId,
          })
        : null,
    [currentUserId, lessonNode.nodeId],
  );
  const usesSectionOneV2Session = useMemo(
    () =>
      exercises.some(
        (exercise) =>
          exercise.contentVersion === 2 ||
          exercise.type === "match_pairs" ||
          exercise.type === "arrange_dialogue" ||
          exercise.type === "sentence_rewrite" ||
          exercise.type === "short_writing",
      ),
    [exercises],
  );
  const reviewExerciseId = isReviewMode
    ? reviewExerciseIds[reviewExerciseIndex]
    : null;
  const currentExercise = isReviewMode
    ? exercises.find((exercise) => exercise.id === reviewExerciseId)
    : exercises[currentExerciseIndex];
  const isAnswered = checkResult !== null;
  const isCorrect = checkResult?.isCorrect ?? false;
  const isPartiallyCorrect = Boolean(
    checkResult && !checkResult.isCorrect && checkResult.scoreRatio > 0,
  );
  const answerComplete = currentExercise
    ? isExerciseAnswerComplete(currentExercise, exerciseAnswer)
    : false;
  const progress = isReviewMode
    ? 100
    : exercises.length === 0
      ? 0
      : (currentExerciseIndex / exercises.length) * 100;
  const totalQuestions = exercises.length;
  const lessonScoreSummary = useMemo(
    () => buildLessonScoreSummary(exercises, attemptResults),
    [attemptResults, exercises],
  );
  const accuracy = usesSectionOneV2Session
    ? lessonScoreSummary.accuracy
    : totalQuestions === 0
      ? 0
      : Math.round((correctAnswersCount / totalQuestions) * 100);
  const correctAnswersForResult = usesSectionOneV2Session
    ? lessonScoreSummary.correctCount
    : correctAnswersCount;
  const partialAnswersCount = usesSectionOneV2Session
    ? lessonScoreSummary.partialCount
    : 0;
  const wrongAnswersCount = usesSectionOneV2Session
    ? lessonScoreSummary.incorrectCount
    : totalQuestions - correctAnswersCount;
  const recoveredAnswersCount = Object.values(reviewResults).filter(
    (reviewResult) => reviewResult.recovered,
  ).length;
  const currentAttempt = currentExercise
    ? attemptResults[currentExercise.id]
    : undefined;
  const canRetryCurrentExercise =
    usesSectionOneV2Session &&
    !isReviewMode &&
    canRetryExerciseAttempt(currentAttempt, checkResult);
  const isCheckpoint = lessonNode.type === "checkpoint";
  const passThreshold = isCheckpoint
    ? CHECKPOINT_PASS_THRESHOLD
    : LESSON_PASS_THRESHOLD;
  const passed = accuracy >= passThreshold;
  const xpLessonId = lessonNode.nodeId;
  const lessonDraft = useMemo<LessonSessionDraft | null>(() => {
    if (
      !currentUserId ||
      !draftReady ||
      !usesSectionOneV2Session ||
      isFinished
    ) {
      return null;
    }

    return {
      schemaVersion: 1,
      kind: "lesson",
      userId: currentUserId,
      contentId: lessonNode.nodeId,
      contentVersion: draftContentVersion,
      catalogFingerprint,
      savedAt: new Date().toISOString(),
      assessmentMode,
      durationSeconds,
      afkCount,
      currentExerciseIndex,
      currentAnswer: exerciseAnswer,
      attemptResults,
      hearts,
      isRetryAttempt: isRetryAttempt || checkResult !== null,
      lockedMatchPairLeftIds,
      isReviewMode,
      reviewExerciseIds,
      reviewExerciseIndex,
      reviewResults,
    };
  }, [
    afkCount,
    assessmentMode,
    attemptResults,
    catalogFingerprint,
    checkResult,
    currentExerciseIndex,
    currentUserId,
    draftContentVersion,
    draftReady,
    durationSeconds,
    exerciseAnswer,
    hearts,
    isFinished,
    isRetryAttempt,
    isReviewMode,
    lessonNode.nodeId,
    lockedMatchPairLeftIds,
    reviewExerciseIds,
    reviewExerciseIndex,
    reviewResults,
    usesSectionOneV2Session,
  ]);
  const {
    read: readLessonDraft,
    clear: clearLessonDraft,
    saveNow: saveLessonDraftNow,
    saveStatus: lessonDraftSaveStatus,
  } = useLearningSessionDraft({
    storageKey: draftStorageKey,
    enabled: Boolean(
      currentUserId && draftReady && usesSectionOneV2Session && !isFinished,
    ),
    draft: lessonDraft,
  });

  useEffect(() => {
    if (
      !currentUserId ||
      draftChecked ||
      !usesSectionOneV2Session ||
      exercises.length === 0
    ) {
      return;
    }

    const restored = validateLearningSessionDraft({
      value: readLessonDraft(),
      kind: "lesson",
      userId: currentUserId,
      contentId: lessonNode.nodeId,
      contentVersion: draftContentVersion,
      catalogFingerprint,
      exercises,
    });

    window.setTimeout(() => {
      if (restored?.kind === "lesson") {
        setResumeDraft(restored);
      } else {
        clearLessonDraft();
        setDraftReady(true);
      }
      setDraftChecked(true);
    }, 0);
  }, [
    catalogFingerprint,
    clearLessonDraft,
    currentUserId,
    draftChecked,
    draftContentVersion,
    exercises,
    lessonNode.nodeId,
    readLessonDraft,
    usesSectionOneV2Session,
  ]);

  useEffect(() => {
    const currentId = currentExercise?.id ?? null;
    if (!currentId) return;
    window.setTimeout(() => setAssessmentMode(preferredAssessmentMode), 0);
    // The preferred mode intentionally applies only when the exercise changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExercise?.id]);

  useEffect(() => {
    let isMounted = true;

    const resolveAccess = async () => {
      if (
        !hasKnownLessonNode ||
        shouldRedirectToLearn ||
        shouldRedirectToCheckpoint
      ) {
        if (isMounted) {
          setIsProgressReady(true);
          setAccessState("allowed");
        }
        return;
      }

      try {
        const response = await fetch("/api/progress/course", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401) {
          setChapterOneProgressOwner(null);
          if (isMounted) {
            setAccessState("redirecting");
            const redirectTarget = `/lesson?id=${encodeURIComponent(rawLessonId)}`;
            router.replace(
              `/sign-in?redirect=${encodeURIComponent(redirectTarget)}`,
            );
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Course progress API request failed");
        }

        const data = (await response.json()) as CourseProgressApiResult;
        const access = getCourseNodeAccess(data.progress, lessonNode.nodeId);

        setChapterOneProgressOwner(data.user.id);
        setCurrentUserId(data.user.id);
        saveChapterOneProgress(
          projectCourseProgressToChapterOne(data.progress),
        );

        if (!access.allowed) {
          if (isMounted) {
            setAccessState("redirecting");
            router.replace(
              `/sections?requested=${encodeURIComponent(access.sectionId ?? "english-section-1")}`,
            );
          }
          return;
        }

        if (isMounted) {
          setIsProgressReady(true);
          setAccessState("allowed");
        }
      } catch (error) {
        console.warn("Could not resolve course progress access:", error);
        if (isMounted) {
          setIsProgressReady(true);
          setAccessState("allowed");
        }
      }
    };

    void resolveAccess();

    return () => {
      isMounted = false;
    };
  }, [
    hasKnownLessonNode,
    lessonNode.nodeId,
    rawLessonId,
    router,
    shouldRedirectToCheckpoint,
    shouldRedirectToLearn,
  ]);

  // Submit one server-side completion request. The server coordinates progress,
  // XP, streak, quests and section unlocks without trusting client rewards.
  useEffect(() => {
    if (!isFinished || hasHandledCompletionRef.current || !isProgressReady)
      return;

    hasHandledCompletionRef.current = true;
    let isCancelled = false;

    const handleCompletion = async () => {
      await Promise.resolve();
      if (isCancelled) return;

      setCompletionBlockedMessage(null);
      setCourseProgressMessage(null);
      setXpError(null);
      setIsClaimingXp(true);

      if (!completionIdempotencyKeyRef.current) {
        completionIdempotencyKeyRef.current = crypto.randomUUID();
      }

      try {
        const response = await fetch("/api/learning/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodeId: xpLessonId,
            accuracy,
            durationSeconds: studyDurationSecondsRef.current,
            afkCount,
            idempotencyKey: completionIdempotencyKeyRef.current,
          }),
        });

        if (response.status === 401) {
          setCompletionBlockedMessage(
            "Bạn cần đăng nhập để lưu kết quả bài học.",
          );
          return;
        }

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          setCompletionBlockedMessage(
            errorData.error ??
              "Node này chưa mở trên lộ trình, nên kết quả không được ghi nhận.",
          );
          return;
        }

        const completion = (await response.json()) as LearningCompletionResult;
        if (isCancelled) return;
        clearLessonDraft();

        if (isChapterOneNode) {
          saveChapterOneProgress(
            projectCourseProgressToChapterOne(completion.progress),
          );
        }

        setXpResult(completion.xp);

        if (completion.unlockedSectionId) {
          setCourseProgressMessage(
            "Bạn đã đạt từ 70% và mở khóa phần học tiếp theo!",
          );
        } else if (isCheckpoint) {
          setCourseProgressMessage(
            completion.passed
              ? "Checkpoint đã hoàn thành. Điểm cao nhất đã được lưu."
              : `Bạn cần ít nhất ${CHECKPOINT_PASS_THRESHOLD}% để mở phần tiếp theo.`,
          );
        } else {
          setCourseProgressMessage(
            completion.alreadyCompleted
              ? "Bài học đã được ghi nhận trước đó."
              : completion.passed
                ? "Tiến độ bài học và gamification đã được đồng bộ."
                : "Bài học chưa đạt điều kiện pass nên tiến độ không thay đổi.",
          );
        }

        const pendingParts = [
          completion.xp.pending ? "XP" : null,
          completion.streak.pending ? "streak" : null,
          completion.quests.pending ? "nhiệm vụ" : null,
        ].filter((item): item is string => Boolean(item));

        if (pendingParts.length > 0) {
          setXpError(
            `${pendingParts.join(", ")} đang chờ đồng bộ. Tiến độ bài học vẫn đã được lưu.`,
          );
        }

        if (
          completion.streak.status &&
          completion.streak.currentStreak !== null
        ) {
          window.dispatchEvent(new Event(STREAK_UPDATED_EVENT));

          setStreakResult({
            status: completion.streak
              .status as StreakNotificationInput["status"],
            currentStreak: completion.streak.currentStreak,
            longestStreak: completion.streak.longestStreak ?? undefined,
            streakFreezes: completion.streak.streakFreezes ?? undefined,
            missedDays: completion.streak.missedDays,
            usedStreakFreezes: completion.streak.usedStreakFreezes,
          });
        }
      } catch (error) {
        console.warn("Could not complete learning node:", error);
        if (!isCancelled) {
          setXpError(
            "Không thể đồng bộ kết quả lúc này. Đáp án của bạn vẫn được giữ để thử lại.",
          );
          hasHandledCompletionRef.current = false;
        }
      } finally {
        if (!isCancelled) setIsClaimingXp(false);
      }
    };

    void handleCompletion();

    return () => {
      isCancelled = true;
    };
  }, [
    accuracy,
    afkCount,
    clearLessonDraft,
    isChapterOneNode,
    isCheckpoint,
    isFinished,
    isProgressReady,
    xpLessonId,
  ]);

  // Check every exercise through the shared pure checker. XP/progress are still
  // handled only after the whole lesson is finished and passed.
  const onCheck = useCallback(() => {
    if (!currentExercise || !exerciseAnswer || !answerComplete || isAnswered)
      return;

    const result = checkExerciseAnswer(currentExercise, exerciseAnswer);
    setCheckResult(result);

    if (!usesSectionOneV2Session) {
      if (result.isCorrect) {
        setCorrectAnswersCount((currentCount) => currentCount + 1);
      } else {
        setHearts((currentHearts) => Math.max(0, currentHearts - 1));
      }
      return;
    }

    if (isReviewMode) {
      setReviewResults((currentResults) => ({
        ...currentResults,
        [currentExercise.id]: {
          exerciseId: currentExercise.id,
          recovered: result.isCorrect,
        },
      }));
      return;
    }

    const previousAttempt = attemptResults[currentExercise.id];
    const shouldLoseHeart =
      result.scoreRatio === 0 &&
      currentExercise.type !== "short_writing" &&
      previousAttempt?.lostHeart !== true;
    const nextAttempt = recordExerciseAttempt({
      exerciseId: currentExercise.id,
      previous: previousAttempt,
      result,
      lostHeart: shouldLoseHeart,
    });

    setAttemptResults((currentAttempts) => ({
      ...currentAttempts,
      [currentExercise.id]: nextAttempt,
    }));
    setIsRetryAttempt(false);

    if (shouldLoseHeart) {
      setHearts((currentHearts) => Math.max(0, currentHearts - 1));
    }
  }, [
    answerComplete,
    attemptResults,
    currentExercise,
    exerciseAnswer,
    isAnswered,
    isReviewMode,
    usesSectionOneV2Session,
  ]);

  const onContinue = useCallback(async () => {
    if (!isAnswered || !currentExercise) return;

    if (canRetryCurrentExercise) {
      if (
        currentExercise.type === "match_pairs" &&
        exerciseAnswer?.type === "match_pairs"
      ) {
        const correctLeftIds = getCorrectMatchPairLeftIds(
          currentExercise,
          exerciseAnswer.pairs,
        );
        const correctLeftIdSet = new Set(correctLeftIds);
        setExerciseAnswer({
          type: "match_pairs",
          pairs: exerciseAnswer.pairs.filter((pair) =>
            correctLeftIdSet.has(pair.leftId),
          ),
        });
        setLockedMatchPairLeftIds(correctLeftIds);
      }

      setCheckResult(null);
      setIsRetryAttempt(true);
      return;
    }

    if (isReviewMode) {
      setExerciseAnswer(null);
      setCheckResult(null);
      setLockedMatchPairLeftIds([]);

      if (reviewExerciseIndex < reviewExerciseIds.length - 1) {
        setReviewExerciseIndex((currentIndex) => currentIndex + 1);
        return;
      }

      const activeSeconds = await studyTimerRef.current?.flush({
        keepalive: true,
      });
      if (typeof activeSeconds === "number") {
        studyDurationSecondsRef.current = activeSeconds;
      }
      setIsReviewMode(false);
      setIsFinished(true);
      return;
    }

    setExerciseAnswer(null);
    setCheckResult(null);
    setLockedMatchPairLeftIds([]);
    setIsRetryAttempt(false);

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((currentIndex) => currentIndex + 1);
      return;
    }

    if (usesSectionOneV2Session) {
      const reviewQueue = createMistakeReviewQueue(
        exercises,
        attemptResults,
        3,
      );
      if (reviewQueue.length > 0) {
        setReviewExerciseIds(reviewQueue);
        setReviewExerciseIndex(0);
        setIsReviewMode(true);
        return;
      }
    }

    const activeSeconds = await studyTimerRef.current?.flush({
      keepalive: true,
    });
    if (typeof activeSeconds === "number") {
      studyDurationSecondsRef.current = activeSeconds;
    }
    setIsFinished(true);
  }, [
    attemptResults,
    canRetryCurrentExercise,
    currentExercise,
    currentExerciseIndex,
    exerciseAnswer,
    exercises,
    isAnswered,
    isReviewMode,
    reviewExerciseIds.length,
    reviewExerciseIndex,
    usesSectionOneV2Session,
  ]);

  // Choice exercises keep the familiar 1-4 shortcuts. Enter checks the current
  // answer and, after feedback is visible, continues to the next exercise.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        isFinished ||
        (hearts === 0 && !isRetryAttempt && !isReviewMode) ||
        !currentExercise
      )
        return;

      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement;

      if (!isAnswered && !isTypingTarget && /^[1-4]$/.test(event.key)) {
        if (
          currentExercise.type === "multiple_choice" ||
          currentExercise.type === "dialogue_choice" ||
          currentExercise.type === "listening_choice"
        ) {
          const option = currentExercise.options[Number(event.key) - 1];
          if (option) {
            setExerciseAnswer({ type: "choice", optionId: option.id });
          }
        }
      }

      if (event.key !== "Enter") return;

      if (isAnswered) {
        event.preventDefault();
        void onContinue();
      } else if (answerComplete) {
        event.preventDefault();
        onCheck();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    answerComplete,
    currentExercise,
    hearts,
    isAnswered,
    isFinished,
    isRetryAttempt,
    isReviewMode,
    onCheck,
    onContinue,
  ]);

  // Restart lesson
  const onRestart = () => {
    clearLessonDraft();
    setCurrentExerciseIndex(0);
    setExerciseAnswer(null);
    setCheckResult(null);
    setHearts(5);
    setIsFinished(false);
    setCorrectAnswersCount(0);
    setAssessmentMode("standard");
    setPreferredAssessmentMode("standard");
    setResumeDraft(null);
    setDraftReady(true);
    setDurationSeconds(0);
    setAfkCount(0);
    setAttemptResults({});
    setLockedMatchPairLeftIds([]);
    setIsRetryAttempt(false);
    setIsReviewMode(false);
    setReviewExerciseIds([]);
    setReviewExerciseIndex(0);
    setReviewResults({});
    setXpResult(null);
    setIsClaimingXp(false);
    setXpError(null);
    setStreakResult(null);
    setCompletionBlockedMessage(null);
    setCourseProgressMessage(null);
    hasHandledCompletionRef.current = false;
    completionIdempotencyKeyRef.current = null;
    studyDurationSecondsRef.current = 0;
    studyTimerRef.current?.reset();
  };

  // Redirect to learn page
  const redirectToLearn = () => {
    saveLessonDraftNow();
    router.push("/learn");
  };

  if (accessState !== "allowed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#182226] text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-sky-500" />
          <p className="text-sm font-bold dark:text-slate-300">
            {accessState === "redirecting"
              ? "Đang chuyển đến lộ trình phù hợp..."
              : "Đang kiểm tra quyền truy cập bài học..."}
          </p>
        </div>
      </div>
    );
  }

  if (shouldRedirectToLearn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#182226] text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-sky-500" />
          <p className="text-sm font-bold dark:text-slate-300">
            Rương thưởng không mở Lesson Player. Đang quay lại lộ trình...
          </p>
        </div>
      </div>
    );
  }

  if (!currentExercise && !isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 text-center dark:bg-[#182226]">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100">
            {hasKnownLessonNode
              ? "Bài học chưa có nội dung hợp lệ"
              : "Không tìm thấy bài học"}
          </h1>
          <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
            {hasKnownLessonNode
              ? "Hãy quay lại lộ trình và thử một bài học khác."
              : "Đường dẫn này không khớp với bài học nào trong khóa Tiếng Anh."}
          </p>
          <Button
            variant="primary"
            onClick={redirectToLearn}
            className="mt-5 h-12 rounded-2xl px-5"
          >
            Quay lại lộ trình
          </Button>
        </div>
      </div>
    );
  }

  // Game over state
  if (
    hearts === 0 &&
    !isFinished &&
    !isAnswered &&
    !isRetryAttempt &&
    !isReviewMode
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#182226] px-4 text-center">
        <div className="relative mx-auto mb-6 flex size-32 items-center justify-center">
          <Image
            src="/robot-sad-v4.png"
            alt="Mascot"
            width={120}
            height={120}
            className="object-contain grayscale opacity-80 animate-robot-sad"
          />
          <div className="absolute -bottom-1 -right-1 flex size-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-md ring-4 ring-white dark:ring-[#182226] animate-bounce">
            <Heart className="size-5 fill-current stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">
          Bạn đã hết tim mất rồi!
        </h1>
        <p className="mt-3 max-w-[400px] text-base font-bold leading-relaxed text-slate-500 dark:text-slate-400">
          Đừng nản lòng nhé! Luyện tập nhiều hơn sẽ giúp bạn ghi nhớ lâu hơn.
          Hãy thử lại nào!
        </p>

        <div className="mt-8 flex w-full max-w-[280px] flex-col gap-3">
          <Button
            variant="primary"
            onClick={onRestart}
            className="h-12 w-full rounded-2xl"
          >
            <RefreshCw className="mr-2 size-4 stroke-[3]" />
            Thử lại bài học
          </Button>

          <Button
            variant="outline"
            onClick={redirectToLearn}
            className="h-12 w-full rounded-2xl border-2 border-slate-200 dark:border-[#202f36] dark:text-slate-200 dark:hover:bg-[#202f36]/40"
          >
            <Home className="mr-2 size-4 stroke-[3]" />
            Quay lại lộ trình
          </Button>
        </div>
      </div>
    );
  }

  // Lesson result state
  if (isFinished) {
    const isCompletionBlocked = Boolean(completionBlockedMessage);
    const isWaitingForXp =
      passed &&
      !isCompletionBlocked &&
      (isClaimingXp || xpResult?.pending === true || (!xpResult && !xpError));
    const earnedXpToDisplay =
      passed && !isCompletionBlocked ? (xpResult?.earnedXp ?? 0) : 0;
    const totalXpToDisplay =
      xpResult?.totalXp !== null && xpResult?.totalXp !== undefined
        ? xpResult.totalXp.toLocaleString("vi-VN")
        : "--";
    const levelToDisplay = xpResult?.level ?? "--";
    const xpStatusMessage =
      completionBlockedMessage ??
      xpError ??
      courseProgressMessage ??
      xpResult?.message;

    return (
      <>
        <LessonResultScreen
          lessonTitle={lessonNode.title}
          isCheckpoint={isCheckpoint}
          passed={passed}
          correctAnswers={correctAnswersForResult}
          partialAnswers={partialAnswersCount}
          wrongAnswers={wrongAnswersCount}
          recoveredAnswers={recoveredAnswersCount}
          totalQuestions={totalQuestions}
          accuracy={accuracy}
          passThreshold={passThreshold}
          xpEarned={earnedXpToDisplay}
          isWaitingForXp={isWaitingForXp}
          xpStatusMessage={xpStatusMessage}
          completionBlocked={isCompletionBlocked}
          totalXp={totalXpToDisplay}
          level={levelToDisplay}
          alreadyClaimed={Boolean(xpResult?.alreadyClaimed)}
          onContinue={redirectToLearn}
          onRestart={onRestart}
          onBackToLearn={redirectToLearn}
        />

        <StreakNotification
          result={streakResult}
          autoHideMs={7000}
          onDismiss={() => setStreakResult(null)}
        />
      </>
    );
  }

  if (!currentExercise) {
    return null;
  }

  const mascotImageSrc =
    !isAnswered || isPartiallyCorrect
      ? "/robot-neutral-v4.png"
      : isCorrect
        ? "/robot-happy-v4.png"
        : "/robot-sad-v4.png";

  const mascotAnimationClass =
    !isAnswered || isPartiallyCorrect
      ? "animate-robot-float"
      : isCorrect
        ? "animate-robot-bounce"
        : "animate-robot-sad";

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#182226] text-slate-800 dark:text-slate-100">
      {/* Header bài học */}
      <LessonHeader
        title={isReviewMode ? `${lessonNode.title} · Ôn lỗi` : lessonNode.title}
        progress={progress}
        hearts={hearts}
        onExitClick={() => setIsExitModalOpen(true)}
      />

      {/* Exercise content */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:py-12">
        <div className="mx-auto flex max-w-[680px] flex-col justify-center gap-6 md:gap-8">
          <div className="flex items-start gap-4">
            <div className="relative size-16 shrink-0 md:size-20">
              <Image
                src={mascotImageSrc}
                alt="Mascot"
                fill
                className={`object-contain ${mascotAnimationClass}`}
              />
            </div>
            <div className="relative rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-[#202f36] dark:bg-[#141f23] md:px-5 md:py-4">
              <span className="absolute left-0 top-6 -translate-x-[9px] rotate-45 border-b-2 border-l-2 border-slate-200 bg-white p-1 dark:border-b-[#202f36] dark:border-l-[#202f36] dark:bg-[#141f23]" />
              <p className="text-base font-black leading-normal text-slate-700 dark:text-slate-200 md:text-lg">
                {currentExercise.instruction}
              </p>
            </div>
          </div>

          {usesSectionOneV2Session ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SilentModeToggle
                mode={preferredAssessmentMode}
                onChange={setPreferredAssessmentMode}
              />
              <div className="flex items-center gap-2">
                {preferredAssessmentMode !== assessmentMode ? (
                  <span className="text-xs font-black text-sky-600 dark:text-sky-300">
                    Áp dụng từ hoạt động tiếp theo
                  </span>
                ) : null}
                <SessionSaveStatus status={lessonDraftSaveStatus} />
              </div>
            </div>
          ) : null}

          {isReviewMode ? (
            <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 px-4 py-3 text-sm font-black text-violet-700 dark:border-violet-950/50 dark:bg-violet-950/20 dark:text-violet-300">
              Ôn lỗi {reviewExerciseIndex + 1}/{reviewExerciseIds.length} ·
              Không mất tim và không cộng thêm XP
            </div>
          ) : null}

          <ExerciseRenderer
            exercise={currentExercise}
            answer={exerciseAnswer}
            disabled={isAnswered}
            result={checkResult}
            lockedMatchPairLeftIds={lockedMatchPairLeftIds}
            hintAvailable={
              usesSectionOneV2Session && (currentAttempt?.attempts ?? 0) > 0
            }
            assessmentMode={assessmentMode}
            revealContext={
              usesSectionOneV2Session
                ? isReviewMode || (isAnswered && !canRetryCurrentExercise)
                : isAnswered
            }
            onAnswerChange={setExerciseAnswer}
          />
        </div>
      </main>

      <footer
        className={`border-t-2 px-4 py-4 transition-colors duration-250 md:px-6 md:py-6
          ${isAnswered ? (isCorrect ? "border-green-200 bg-green-50 dark:border-green-950/40 dark:bg-green-950/20" : isPartiallyCorrect ? "border-amber-200 bg-amber-50 dark:border-amber-950/40 dark:bg-amber-950/20" : "border-rose-200 bg-rose-50 dark:border-rose-950/40 dark:bg-rose-950/20") : "border-slate-200 bg-white dark:border-[#202f36] dark:bg-[#182226]"}
        `}
      >
        <div className="mx-auto flex max-w-[840px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            {checkResult ? (
              <ExerciseFeedback
                result={checkResult}
                attempts={isReviewMode ? 1 : (currentAttempt?.attempts ?? 1)}
                canRetry={canRetryCurrentExercise}
                revealCorrectAnswer={
                  !usesSectionOneV2Session ||
                  isReviewMode ||
                  !canRetryCurrentExercise
                }
                isReviewMode={isReviewMode}
              />
            ) : (
              <p className="hidden text-sm font-bold text-slate-400 sm:block">
                Hoàn thành câu trả lời rồi bấm Kiểm tra nhé!
              </p>
            )}
          </div>

          <div className="shrink-0">
            {!isAnswered ? (
              <Button
                variant="lessonPrimary"
                disabled={!answerComplete}
                onClick={onCheck}
                className="h-12 w-full rounded-2xl sm:w-40"
              >
                Kiểm tra
              </Button>
            ) : (
              <Button
                variant="lessonPrimary"
                onClick={() => void onContinue()}
                className="h-12 w-full rounded-2xl sm:w-40"
              >
                {canRetryCurrentExercise
                  ? "Sửa lại"
                  : isReviewMode
                    ? reviewExerciseIndex === reviewExerciseIds.length - 1
                      ? "Xong ôn lỗi"
                      : "Tiếp tục"
                    : currentExerciseIndex === exercises.length - 1
                      ? "Hoàn thành"
                      : "Tiếp tục"}
              </Button>
            )}
          </div>
        </div>
      </footer>

      <ResumeSessionDialog
        open={Boolean(resumeDraft)}
        title="Tiếp tục phiên trước?"
        detail={`Bạn đang ở hoạt động ${(resumeDraft?.currentExerciseIndex ?? 0) + 1}/${exercises.length}.`}
        onResume={() => {
          if (!resumeDraft) return;
          setCurrentExerciseIndex(resumeDraft.currentExerciseIndex);
          setExerciseAnswer(resumeDraft.currentAnswer);
          setCheckResult(null);
          setAttemptResults(resumeDraft.attemptResults);
          setHearts(resumeDraft.hearts);
          setIsRetryAttempt(resumeDraft.isRetryAttempt);
          setLockedMatchPairLeftIds(resumeDraft.lockedMatchPairLeftIds);
          setIsReviewMode(resumeDraft.isReviewMode);
          setReviewExerciseIds(resumeDraft.reviewExerciseIds);
          setReviewExerciseIndex(resumeDraft.reviewExerciseIndex);
          setReviewResults(resumeDraft.reviewResults);
          setAssessmentMode(resumeDraft.assessmentMode);
          setPreferredAssessmentMode(resumeDraft.assessmentMode);
          setDurationSeconds(resumeDraft.durationSeconds);
          setAfkCount(resumeDraft.afkCount);
          studyDurationSecondsRef.current = resumeDraft.durationSeconds;
          window.setTimeout(
            () =>
              studyTimerRef.current?.restore(
                resumeDraft.durationSeconds,
                resumeDraft.afkCount,
              ),
            0,
          );
          setResumeDraft(null);
          setDraftReady(true);
        }}
        onRestart={() => {
          clearLessonDraft();
          setResumeDraft(null);
          setDraftReady(true);
          onRestart();
        }}
      />

      {/* Modal xác nhận thoát */}
      <ExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={redirectToLearn}
      />
      <LessonStudyTimer
        ref={studyTimerRef}
        isActive={
          !isFinished &&
          (hearts > 0 || isRetryAttempt || isReviewMode) &&
          !shouldRedirectToLearn &&
          !isExitModalOpen
        }
        onActiveSecondsChange={(seconds) => {
          studyDurationSecondsRef.current = seconds;
          setDurationSeconds(seconds);
        }}
        onAfkCountChange={setAfkCount}
      />
    </div>
  );
};

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#182226] text-slate-500 dark:text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <div className="size-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-sky-500" />
            <p className="text-sm font-bold dark:text-slate-300">
              Đang tải bài học...
            </p>
          </div>
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
