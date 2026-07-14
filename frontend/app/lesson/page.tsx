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
import { ExerciseFeedback } from "@/components/lesson/exercise-feedback";
import { ExerciseRenderer } from "@/components/lesson/exercise-renderer";
import {
  checkExerciseAnswer,
  isExerciseAnswerComplete,
} from "@/lib/exercises/check-exercise-answer";
import { getExercisesForLesson } from "@/lib/exercises/exercise-catalog";
import { getLearningNodeById } from "@/lib/courses/course-catalog";
import {
  getCourseNodeAccess,
  getSectionIdForNode,
} from "@/lib/courses/course-access";
import { projectCourseProgressToChapterOne } from "@/lib/courses/chapter-one-adapter";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { ExerciseAnswer, ExerciseCheckResult } from "@/types/exercise";
import type { LearningCompletionResult } from "@/types/learning-completion";

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
  const lessonSectionId = getSectionIdForNode(lessonNode.nodeId);

  useEffect(() => {
    if (shouldRedirectToLearn) {
      router.replace("/learn");
    }
  }, [router, shouldRedirectToLearn]);

  // Exercise engine states. The completion/XP flow below remains unchanged.
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
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

  // XP + Streak states
  const [xpResult, setXpResult] = useState<LearningCompletionResult["xp"] | null>(null);
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
  const currentExercise = exercises[currentExerciseIndex];
  const isAnswered = checkResult !== null;
  const isCorrect = checkResult?.isCorrect ?? false;
  const answerComplete = currentExercise
    ? isExerciseAnswerComplete(currentExercise, exerciseAnswer)
    : false;
  const progress =
    exercises.length === 0
      ? 0
      : (currentExerciseIndex / exercises.length) * 100;
  const totalQuestions = exercises.length;
  const accuracy =
    totalQuestions === 0
      ? 0
      : Math.round((correctAnswersCount / totalQuestions) * 100);
  const wrongAnswersCount = totalQuestions - correctAnswersCount;
  const isCheckpoint = lessonNode.type === "checkpoint";
  const passThreshold = isCheckpoint
    ? CHECKPOINT_PASS_THRESHOLD
    : LESSON_PASS_THRESHOLD;
  const passed = accuracy >= passThreshold;
  const xpLessonId = lessonNode.nodeId;

  useEffect(() => {
    let isMounted = true;

    const resolveAccess = async () => {
      if (!hasKnownLessonNode || shouldRedirectToLearn) {
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
        saveChapterOneProgress(
          projectCourseProgressToChapterOne(data.progress),
        );

        if (!access.allowed) {
          if (isMounted) {
            setAccessState("redirecting");
            router.replace(
              `/learn?locked=${encodeURIComponent(access.sectionId ?? "english-section-1")}`,
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
            afkCount: studyTimerRef.current?.getAfkCount() ?? 0,
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

    if (result.isCorrect) {
      setCorrectAnswersCount((currentCount) => currentCount + 1);
    } else {
      setHearts((currentHearts) => Math.max(0, currentHearts - 1));
    }
  }, [answerComplete, currentExercise, exerciseAnswer, isAnswered]);

  const onContinue = useCallback(async () => {
    if (!isAnswered) return;

    setExerciseAnswer(null);
    setCheckResult(null);

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((currentIndex) => currentIndex + 1);
      return;
    }

    const activeSeconds = await studyTimerRef.current?.flush({
      keepalive: true,
    });
    if (typeof activeSeconds === "number") {
      studyDurationSecondsRef.current = activeSeconds;
    }
    setIsFinished(true);
  }, [currentExerciseIndex, exercises.length, isAnswered]);

  // Choice exercises keep the familiar 1-4 shortcuts. Enter checks the current
  // answer and, after feedback is visible, continues to the next exercise.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFinished || hearts === 0 || !currentExercise) return;

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
    onCheck,
    onContinue,
  ]);

  // Restart lesson
  const onRestart = () => {
    setCurrentExerciseIndex(0);
    setExerciseAnswer(null);
    setCheckResult(null);
    setHearts(5);
    setIsFinished(false);
    setCorrectAnswersCount(0);
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
    router.push(
      lessonSectionId
        ? `/learn?section=${encodeURIComponent(lessonSectionId)}`
        : "/learn",
    );
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
  if (hearts === 0 && !isFinished && !isAnswered) {
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
          correctAnswers={correctAnswersCount}
          wrongAnswers={wrongAnswersCount}
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

  const mascotImageSrc = !isAnswered
    ? "/robot-neutral-v4.png"
    : isCorrect
      ? "/robot-happy-v4.png"
      : "/robot-sad-v4.png";

  const mascotAnimationClass = !isAnswered
    ? "animate-robot-float"
    : isCorrect
      ? "animate-robot-bounce"
      : "animate-robot-sad";

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#182226] text-slate-800 dark:text-slate-100">
      {/* Header bài học */}
      <LessonHeader
        title={lessonNode.title}
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

          <ExerciseRenderer
            exercise={currentExercise}
            answer={exerciseAnswer}
            disabled={isAnswered}
            result={checkResult}
            onAnswerChange={setExerciseAnswer}
          />
        </div>
      </main>

      <footer
        className={`border-t-2 px-4 py-4 transition-colors duration-250 md:px-6 md:py-6
          ${isAnswered ? (isCorrect ? "border-green-200 bg-green-50 dark:border-green-950/40 dark:bg-green-950/20" : "border-rose-200 bg-rose-50 dark:border-rose-950/40 dark:bg-rose-950/20") : "border-slate-200 bg-white dark:border-[#202f36] dark:bg-[#182226]"}
        `}
      >
        <div className="mx-auto flex max-w-[840px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            {checkResult ? (
              <ExerciseFeedback result={checkResult} />
            ) : (
              <p className="hidden text-sm font-bold text-slate-400 sm:block">
                Hoàn thành câu trả lời rồi bấm Kiểm tra nhé!
              </p>
            )}
          </div>

          <div className="shrink-0">
            {!isAnswered ? (
              <Button
                variant={answerComplete ? "secondary" : "default"}
                disabled={!answerComplete}
                onClick={onCheck}
                className="h-12 w-full rounded-2xl sm:w-40"
              >
                Kiểm tra
              </Button>
            ) : (
              <Button
                variant={isCorrect ? "secondary" : "danger"}
                onClick={() => void onContinue()}
                className="h-12 w-full rounded-2xl sm:w-40"
              >
                {currentExerciseIndex === exercises.length - 1
                  ? "Hoàn thành"
                  : "Tiếp tục"}
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Modal xác nhận thoát */}
      <ExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={redirectToLearn}
      />
      <LessonStudyTimer
        ref={studyTimerRef}
        isActive={!isFinished && hearts > 0 && !shouldRedirectToLearn}
        onActiveSecondsChange={(seconds) => {
          studyDurationSecondsRef.current = seconds;
        }}
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
