"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Braces, RotateCcw } from "lucide-react";

import { ExerciseFeedback } from "@/components/lesson/exercise-feedback";
import { ExerciseRenderer } from "@/components/lesson/exercise-renderer";
import { Button } from "@/components/ui/button";
import { sectionOneV2PreviewExercises } from "@/data/exercises/english/section-1/section-one-v2-preview";
import {
  checkExerciseAnswer,
  isExerciseAnswerComplete,
} from "@/lib/exercises/check-exercise-answer";
import {
  canRetryExerciseAttempt,
  recordExerciseAttempt,
} from "@/lib/exercises/exercise-attempt";
import { getCorrectMatchPairLeftIds } from "@/lib/exercises/mistake-review";
import type { ExerciseAnswer, ExerciseCheckResult } from "@/types/exercise";
import type { ExerciseAttemptResult } from "@/types/lesson-session";

export const SectionOneV2PreviewClient = () => {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [answer, setAnswer] = useState<ExerciseAnswer | null>(null);
  const [result, setResult] = useState<ExerciseCheckResult | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [attempt, setAttempt] = useState<ExerciseAttemptResult | undefined>();
  const [lockedMatchPairLeftIds, setLockedMatchPairLeftIds] = useState<
    string[]
  >([]);

  const exercise = sectionOneV2PreviewExercises[exerciseIndex];
  const answerComplete = useMemo(
    () => isExerciseAnswerComplete(exercise, answer),
    [answer, exercise],
  );

  const resetCurrent = () => {
    setAnswer(null);
    setResult(null);
    setAttempt(undefined);
    setLockedMatchPairLeftIds([]);
  };

  const moveTo = (nextIndex: number) => {
    setExerciseIndex(nextIndex);
    setAnswer(null);
    setResult(null);
    setAttempt(undefined);
    setLockedMatchPairLeftIds([]);
    setShowDebug(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canRetry = canRetryExerciseAttempt(attempt, result);

  const checkCurrent = () => {
    if (!answerComplete || !answer || result) return;
    const nextResult = checkExerciseAnswer(exercise, answer);
    setResult(nextResult);
    setAttempt((currentAttempt) =>
      recordExerciseAttempt({
        exerciseId: exercise.id,
        previous: currentAttempt,
        result: nextResult,
        lostHeart: false,
      }),
    );
  };

  const retryCurrent = () => {
    if (!canRetry) return;
    if (exercise.type === "match_pairs" && answer?.type === "match_pairs") {
      const correctLeftIds = getCorrectMatchPairLeftIds(exercise, answer.pairs);
      const correctLeftIdSet = new Set(correctLeftIds);
      setAnswer({
        type: "match_pairs",
        pairs: answer.pairs.filter((pair) => correctLeftIdSet.has(pair.leftId)),
      });
      setLockedMatchPairLeftIds(correctLeftIds);
    }
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 dark:bg-[#111a1e] dark:text-slate-100 md:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-3xl border-2 border-sky-200 bg-white p-5 shadow-sm dark:border-sky-900 dark:bg-[#182226] md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1486CC]">
            Development preview
          </p>
          <h1 className="mt-2 text-2xl font-black md:text-3xl">
            Section 1 V2 — Phase 3
          </h1>
          <p className="mt-2 text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
            Trang này kiểm tra partial scoring và hai lần thử. Không ghi XP,
            nhiệm vụ, streak hoặc tiến độ khóa học.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {sectionOneV2PreviewExercises.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => moveTo(index)}
                aria-current={index === exerciseIndex ? "step" : undefined}
                className={`min-h-11 rounded-2xl border-2 px-4 text-xs font-black transition ${
                  index === exerciseIndex
                    ? "border-[#1486CC] bg-sky-50 text-[#1486CC] dark:bg-sky-950/20"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-[#202f36] dark:bg-[#141f23] dark:text-slate-300"
                }`}
              >
                {index + 1}. {item.type}
              </button>
            ))}
          </div>
        </header>

        <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-[#202f36] dark:bg-[#182226] md:p-7">
          <div className="mb-6 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-[#141f23]">
            <p className="text-sm font-black text-slate-700 dark:text-slate-200">
              {exercise.instruction}
            </p>
          </div>

          <ExerciseRenderer
            exercise={exercise}
            answer={answer}
            disabled={result !== null}
            result={result}
            lockedMatchPairLeftIds={lockedMatchPairLeftIds}
            onAnswerChange={setAnswer}
          />
        </section>

        {result ? (
          <section
            className={`rounded-3xl border-2 p-5 ${result.isCorrect ? "border-green-200 bg-green-50 dark:border-green-950 dark:bg-green-950/20" : result.scoreRatio > 0 ? "border-amber-200 bg-amber-50 dark:border-amber-950 dark:bg-amber-950/20" : "border-rose-200 bg-rose-50 dark:border-rose-950 dark:bg-rose-950/20"}`}
          >
            <ExerciseFeedback
              result={result}
              attempts={attempt?.attempts ?? 1}
              canRetry={canRetry}
              revealCorrectAnswer={!canRetry}
            />
          </section>
        ) : null}

        <footer className="sticky bottom-3 rounded-3xl border-2 border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-[#202f36] dark:bg-[#182226]/95">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => moveTo(Math.max(0, exerciseIndex - 1))}
                disabled={exerciseIndex === 0}
                className="h-12 rounded-2xl px-4 normal-case tracking-normal"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Trước
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  moveTo(
                    Math.min(
                      sectionOneV2PreviewExercises.length - 1,
                      exerciseIndex + 1,
                    ),
                  )
                }
                disabled={
                  exerciseIndex === sectionOneV2PreviewExercises.length - 1
                }
                className="h-12 rounded-2xl px-4 normal-case tracking-normal"
              >
                Sau
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDebug((current) => !current)}
                className="h-12 rounded-2xl px-4 normal-case tracking-normal"
              >
                <Braces className="size-4" aria-hidden="true" />
                JSON
              </Button>
              <Button
                type="button"
                variant="primary-outline"
                onClick={resetCurrent}
                className="h-12 rounded-2xl px-4 normal-case tracking-normal"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Reset
              </Button>
              <Button
                type="button"
                variant="lessonPrimary"
                disabled={!result && !answerComplete}
                onClick={result && canRetry ? retryCurrent : checkCurrent}
                className="h-12 min-w-36 rounded-2xl px-5 normal-case tracking-normal"
              >
                {result && canRetry
                  ? "Sửa lại"
                  : result
                    ? "Đã hoàn tất"
                    : "Kiểm tra"}
              </Button>
            </div>
          </div>
        </footer>

        {showDebug ? (
          <pre className="overflow-x-auto rounded-3xl border-2 border-slate-800 bg-slate-950 p-5 text-xs leading-6 text-sky-200">
            {JSON.stringify({ exercise, answer, result }, null, 2)}
          </pre>
        ) : null}
      </div>
    </main>
  );
};
