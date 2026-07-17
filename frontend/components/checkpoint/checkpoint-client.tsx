"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardCheck, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { CheckpointModeDialog } from "@/components/checkpoint/checkpoint-mode-dialog";
import { CheckpointProgress } from "@/components/checkpoint/checkpoint-progress";
import { CheckpointResultScreen } from "@/components/checkpoint/checkpoint-result-screen";
import { CheckpointSubmitDialog } from "@/components/checkpoint/checkpoint-submit-dialog";
import { ExerciseRenderer } from "@/components/lesson/exercise-renderer";
import { ResumeSessionDialog } from "@/components/lesson/resume-session-dialog";
import { SessionSaveStatus } from "@/components/lesson/session-save-status";
import {
  LessonStudyTimer,
  type LessonStudyTimerHandle,
} from "@/components/lesson-study-timer";
import { Button } from "@/components/ui/button";
import { useLearningSessionDraft } from "@/hooks/use-learning-session-draft";
import { isExerciseAnswerComplete } from "@/lib/exercises/check-exercise-answer";
import { createExerciseCatalogFingerprint } from "@/lib/learning-session/draft-fingerprint";
import { getLearningSessionDraftKey } from "@/lib/learning-session/draft-storage";
import { validateLearningSessionDraft } from "@/lib/learning-session/draft-validator";
import type {
  CheckpointPageData,
  CheckpointSubmissionAnswer,
  CheckpointSubmissionResult,
} from "@/types/checkpoint";
import type { ExerciseAnswer } from "@/types/exercise";
import type {
  AssessmentMode,
  CheckpointSessionDraft,
} from "@/types/learning-session-draft";

export const CheckpointClient = ({ data }: { data: CheckpointPageData }) => {
  const router = useRouter();
  const timerRef = useRef<LessonStudyTimerHandle | null>(null);
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ExerciseAnswer>>({});
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode | null>(
    null,
  );
  const [attemptStarted, setAttemptStarted] = useState(false);
  const [resumeDraft, setResumeDraft] = useState<CheckpointSessionDraft | null>(
    null,
  );
  const [draftChecked, setDraftChecked] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [afkCount, setAfkCount] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckpointSubmissionResult | null>(null);

  const fingerprint = useMemo(
    () => createExerciseCatalogFingerprint(data.exercises),
    [data.exercises],
  );
  const storageKey = useMemo(
    () =>
      getLearningSessionDraftKey({
        kind: "checkpoint",
        userId: data.userId,
        contentId: data.checkpointId,
      }),
    [data.checkpointId, data.userId],
  );
  const contentVersion = Math.max(
    1,
    ...data.exercises.map((exercise) => exercise.contentVersion ?? 1),
  );

  const draft = useMemo<CheckpointSessionDraft | null>(() => {
    if (!attemptStarted || !assessmentMode || result) return null;
    return {
      schemaVersion: 1,
      kind: "checkpoint",
      userId: data.userId,
      contentId: data.checkpointId,
      contentVersion,
      catalogFingerprint: fingerprint,
      savedAt: new Date().toISOString(),
      assessmentMode,
      durationSeconds,
      afkCount,
      currentExerciseIndex: currentIndex,
      answers,
      submissionId,
    };
  }, [
    afkCount,
    answers,
    assessmentMode,
    attemptStarted,
    contentVersion,
    currentIndex,
    data.checkpointId,
    data.userId,
    durationSeconds,
    fingerprint,
    result,
    submissionId,
  ]);

  const { read, clear, saveNow, saveStatus } = useLearningSessionDraft({
    storageKey,
    enabled: attemptStarted && !result,
    draft,
  });

  useEffect(() => {
    if (draftChecked) return;
    const restored = validateLearningSessionDraft({
      value: read(),
      kind: "checkpoint",
      userId: data.userId,
      contentId: data.checkpointId,
      contentVersion,
      catalogFingerprint: fingerprint,
      exercises: data.exercises,
    });
    window.setTimeout(() => {
      if (restored?.kind === "checkpoint") setResumeDraft(restored);
      else clear();
      setDraftChecked(true);
    }, 0);
  }, [
    clear,
    contentVersion,
    data.checkpointId,
    data.exercises,
    data.userId,
    draftChecked,
    fingerprint,
    read,
  ]);

  const currentExercise = data.exercises[currentIndex];
  const answeredExerciseIds = useMemo(
    () =>
      new Set(
        data.exercises
          .filter((exercise) =>
            isExerciseAnswerComplete(exercise, answers[exercise.id] ?? null),
          )
          .map((exercise) => exercise.id),
      ),
    [answers, data.exercises],
  );

  const beginMode = (mode: AssessmentMode) => {
    clear();
    setSubmissionId(crypto.randomUUID());
    setAssessmentMode(mode);
    setAttemptStarted(true);
    setResumeDraft(null);
    setCurrentIndex(0);
    setAnswers({});
    setDurationSeconds(0);
    setAfkCount(0);
    timerRef.current?.reset();
  };

  const resumeAttempt = () => {
    if (!resumeDraft) return;
    setSubmissionId(resumeDraft.submissionId);
    setAssessmentMode(resumeDraft.assessmentMode);
    setCurrentIndex(resumeDraft.currentExerciseIndex);
    setAnswers(resumeDraft.answers);
    setDurationSeconds(resumeDraft.durationSeconds);
    setAfkCount(resumeDraft.afkCount);
    setAttemptStarted(true);
    setResumeDraft(null);
    window.setTimeout(
      () =>
        timerRef.current?.restore(
          resumeDraft.durationSeconds,
          resumeDraft.afkCount,
        ),
      0,
    );
  };

  const openSubmitDialog = () => {
    setError(null);
    saveNow();
    setSubmitDialogOpen(true);
  };

  const returnToFirstMissing = () => {
    const missingIndex = data.exercises.findIndex(
      (exercise) => !answeredExerciseIds.has(exercise.id),
    );
    if (missingIndex >= 0) setCurrentIndex(missingIndex);
    setSubmitDialogOpen(false);
  };

  const submitCheckpoint = async () => {
    if (!assessmentMode) return;
    setIsSubmitting(true);
    setError(null);

    const activeSeconds =
      (await timerRef.current?.flush({ keepalive: true })) ??
      timerRef.current?.getActiveSeconds() ??
      durationSeconds;
    setDurationSeconds(activeSeconds);
    const submissionAnswers: CheckpointSubmissionAnswer[] = Object.entries(
      answers,
    ).map(([exerciseId, answer]) => ({ exerciseId, answer }));

    try {
      const response = await fetch("/api/progress/course/checkpoint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          checkpointId: data.checkpointId,
          answers: submissionAnswers,
          durationSeconds: activeSeconds,
          afkCount,
          idempotencyKey: submissionId,
          assessmentMode,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | CheckpointSubmissionResult
        | { error?: string; message?: string }
        | null;

      if (!response.ok || !payload || !("success" in payload)) {
        throw new Error(
          payload && "message" in payload
            ? payload.message
            : payload && "error" in payload
              ? payload.error
              : "Không thể nộp checkpoint lúc này.",
        );
      }

      clear();
      setResult(payload);
      setSubmitDialogOpen(false);
    } catch (submissionError) {
      saveNow();
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Không thể nộp checkpoint lúc này.",
      );
      setSubmitDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAttempt = () => {
    clear();
    setSubmissionId(crypto.randomUUID());
    timerRef.current?.reset();
    setCurrentIndex(0);
    setAnswers({});
    setAssessmentMode(null);
    setAttemptStarted(false);
    setDurationSeconds(0);
    setAfkCount(0);
    setSubmitDialogOpen(false);
    setError(null);
    setResult(null);
  };

  if (result) {
    return (
      <CheckpointResultScreen
        result={result}
        onRetake={resetAttempt}
        onBackToLearn={() => router.push("/learn")}
        onContinueToSectionTwo={() =>
          router.push("/sections?requested=english-section-2")
        }
        onOpenLesson={(lessonId) => router.push(`/lesson?id=${lessonId}`)}
      />
    );
  }

  if (!draftChecked) return null;

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800 dark:bg-[#10191d] dark:text-slate-100">
      <CheckpointModeDialog
        open={!resumeDraft && !attemptStarted}
        onSelect={beginMode}
      />
      <ResumeSessionDialog
        open={Boolean(resumeDraft)}
        title="Tiếp tục A2 Checkpoint?"
        detail={`Bạn đã trả lời ${resumeDraft ? Object.keys(resumeDraft.answers).length : 0}/${data.exercises.length} câu.`}
        warning="Bắt đầu lại sẽ xóa toàn bộ đáp án đã lưu của attempt này."
        onResume={resumeAttempt}
        onRestart={() => {
          clear();
          setResumeDraft(null);
          setAssessmentMode(null);
          setAttemptStarted(false);
        }}
      />

      <header className="border-b-2 border-slate-200 bg-white px-4 py-4 dark:border-[#263840] dark:bg-[#152126] sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <button
            type="button"
            onClick={() => {
              saveNow();
              router.push("/learn");
            }}
            aria-label="Thoát checkpoint"
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-[#2a3c44] dark:hover:bg-[#1b292f]"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black text-slate-900 dark:text-white sm:text-xl">
              {data.title}
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              12 câu ·{" "}
              {assessmentMode === "silent" ? "Không âm thanh" : "Tiêu chuẩn"} ·
              Cần {data.passThreshold}% để mở Section 2
            </p>
          </div>
          <SessionSaveStatus status={saveStatus} />
          <Button
            type="button"
            variant="primary-outline"
            onClick={openSubmitDialog}
            className="hidden h-11 rounded-2xl sm:inline-flex"
          >
            <Send className="size-4" /> Nộp bài
          </Button>
        </div>
      </header>

      {attemptStarted && currentExercise ? (
        <>
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto max-w-5xl space-y-6">
              <CheckpointProgress
                currentIndex={currentIndex}
                answeredExerciseIds={answeredExerciseIds}
                exerciseIds={data.exercises.map((exercise) => exercise.id)}
                onSelect={setCurrentIndex}
              />
              <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-[#2a3c44] dark:bg-[#152126] sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-100 text-[#1486CC] dark:bg-sky-950/40 dark:text-sky-300">
                      <ClipboardCheck className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                        Câu {currentIndex + 1}/{data.exercises.length}
                      </p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {currentExercise.instruction}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500 dark:bg-[#223138] dark:text-slate-300">
                    Có thể sửa trước khi nộp
                  </span>
                </div>
                <ExerciseRenderer
                  exercise={currentExercise}
                  answer={answers[currentExercise.id] ?? null}
                  disabled={false}
                  result={null}
                  hintAvailable={false}
                  revealContext={false}
                  assessmentMode={assessmentMode ?? "standard"}
                  onAnswerChange={(answer) =>
                    setAnswers((current) => ({
                      ...current,
                      [currentExercise.id]: answer,
                    }))
                  }
                />
              </section>
              {error ? (
                <p
                  role="alert"
                  className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 dark:border-rose-950 dark:bg-rose-950/20 dark:text-rose-300"
                >
                  {error}
                </p>
              ) : null}
            </div>
          </main>
          <footer className="sticky bottom-0 border-t-2 border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-[#263840] dark:bg-[#152126]/95 sm:px-6">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
              <Button
                type="button"
                variant="primary-outline"
                disabled={currentIndex === 0}
                onClick={() =>
                  setCurrentIndex((index) => Math.max(0, index - 1))
                }
                className="h-12 rounded-2xl px-4"
              >
                <ArrowLeft className="size-4" /> Trước
              </Button>
              {currentIndex < data.exercises.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() =>
                    setCurrentIndex((index) =>
                      Math.min(data.exercises.length - 1, index + 1),
                    )
                  }
                  className="h-12 rounded-2xl px-5"
                >
                  Tiếp theo <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={openSubmitDialog}
                  className="h-12 rounded-2xl px-5"
                >
                  <Send className="size-4" /> Nộp bài
                </Button>
              )}
            </div>
          </footer>
          <CheckpointSubmitDialog
            open={submitDialogOpen}
            answeredCount={answeredExerciseIds.size}
            totalQuestions={data.exercises.length}
            isSubmitting={isSubmitting}
            onClose={() => setSubmitDialogOpen(false)}
            onReturnToMissing={returnToFirstMissing}
            onSubmit={() => void submitCheckpoint()}
          />
          <LessonStudyTimer
            ref={timerRef}
            isActive={!isSubmitting}
            onActiveSecondsChange={setDurationSeconds}
          />
        </>
      ) : null}
    </div>
  );
};
