"use client";

import { useMemo, useState } from "react";
import { Link2, RotateCcw, Unlink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ExerciseCheckResult,
  MatchPairsExercise,
  MatchPairsExerciseAnswer,
} from "@/types/exercise";

type Props = {
  exercise: MatchPairsExercise;
  answer: MatchPairsExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  lockedLeftIds?: string[];
  onAnswerChange: (answer: MatchPairsExerciseAnswer) => void;
};

export const MatchPairsExerciseView = ({
  exercise,
  answer,
  disabled,
  result,
  lockedLeftIds = [],
  onAnswerChange,
}: Props) => {
  const [activeLeftId, setActiveLeftId] = useState<string | null>(null);
  const pairs = useMemo(() => answer?.pairs ?? [], [answer?.pairs]);
  const pairByLeftId = useMemo(
    () => new Map(pairs.map((pair) => [pair.leftId, pair.rightId])),
    [pairs],
  );
  const pairByRightId = useMemo(
    () => new Map(pairs.map((pair) => [pair.rightId, pair.leftId])),
    [pairs],
  );
  const lockedLeftIdSet = useMemo(
    () => new Set(lockedLeftIds),
    [lockedLeftIds],
  );
  const lockedRightIdSet = useMemo(
    () =>
      new Set(
        pairs
          .filter((pair) => lockedLeftIdSet.has(pair.leftId))
          .map((pair) => pair.rightId),
      ),
    [lockedLeftIdSet, pairs],
  );
  const correctByLeftId = useMemo(
    () =>
      new Map((exercise.correctPairs ?? []).map((pair) => [pair.leftId, pair.rightId])),
    [exercise.correctPairs],
  );

  const createPair = (rightId: string) => {
    if (!activeLeftId || disabled || lockedLeftIdSet.has(activeLeftId)) return;
    if (lockedRightIdSet.has(rightId)) return;

    const nextPairs = pairs.filter(
      (pair) => pair.leftId !== activeLeftId && pair.rightId !== rightId,
    );
    nextPairs.push({ leftId: activeLeftId, rightId });
    onAnswerChange({ type: "match_pairs", pairs: nextPairs });
    setActiveLeftId(null);
  };

  const removePair = (leftId: string) => {
    if (disabled || lockedLeftIdSet.has(leftId)) return;
    onAnswerChange({
      type: "match_pairs",
      pairs: pairs.filter((pair) => pair.leftId !== leftId),
    });
    if (activeLeftId === leftId) setActiveLeftId(null);
  };

  const correctCount = result
    ? (exercise.correctPairs ?? []).filter(
        (pair) => pairByLeftId.get(pair.leftId) === pair.rightId,
      ).length
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black leading-snug text-slate-800 dark:text-slate-100 md:text-2xl">
          {exercise.prompt}
        </h2>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
          Chạm một thẻ bên trái, sau đó chạm thẻ phù hợp bên phải.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2" aria-label="Danh sách bên trái">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Thông tin
          </p>
          {exercise.leftItems.map((item) => {
            const pairedRightId = pairByLeftId.get(item.id);
            const pairNumber =
              pairs.findIndex((pair) => pair.leftId === item.id) + 1;
            const isActive = activeLeftId === item.id;
            const isLocked = lockedLeftIdSet.has(item.id);
            const isCorrectPair = Boolean(
              result && pairedRightId === correctByLeftId.get(item.id),
            );
            const isWrongPair = Boolean(
              result && pairedRightId && !isCorrectPair,
            );

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled || isLocked}
                aria-pressed={isActive}
                onClick={() =>
                  setActiveLeftId((current) =>
                    current === item.id ? null : item.id,
                  )
                }
                className={cn(
                  "flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left text-sm font-black text-slate-700 shadow-[0_3px_0_#e2e8f0] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40 dark:border-[#202f36] dark:bg-[#141f23] dark:text-slate-200 dark:shadow-[0_3px_0_#0c1214]",
                  !disabled &&
                    "hover:bg-slate-50 active:translate-y-px dark:hover:bg-[#1f2d33]",
                  isActive &&
                    "border-sky-500 bg-sky-50 text-sky-700 shadow-[0_3px_0_#0ea5e9] dark:bg-sky-950/30 dark:text-sky-300",
                  pairedRightId &&
                    !result &&
                    "border-sky-300 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/20",
                  isCorrectPair &&
                    "border-green-500 bg-green-50 text-green-700 shadow-[0_3px_0_#22c55e] dark:bg-green-950/20 dark:text-green-300",
                  isLocked &&
                    "cursor-default border-green-400 bg-green-50/70 dark:border-green-900 dark:bg-green-950/20",
                  isWrongPair &&
                    "border-rose-500 bg-rose-50 text-rose-700 shadow-[0_3px_0_#f43f5e] dark:bg-rose-950/20 dark:text-rose-300",
                )}
              >
                <span>{item.text}</span>
                {pairedRightId ? (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                    {pairNumber}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="space-y-2" aria-label="Danh sách bên phải">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Nội dung phù hợp
          </p>
          {exercise.rightItems.map((item) => {
            const pairedLeftId = pairByRightId.get(item.id);
            const pairNumber =
              pairs.findIndex((pair) => pair.rightId === item.id) + 1;
            const isLocked = lockedRightIdSet.has(item.id);
            const isAvailable = Boolean(activeLeftId) && !disabled && !isLocked;
            const isCorrectPair = Boolean(
              result &&
              pairedLeftId &&
              correctByLeftId.get(pairedLeftId) === item.id,
            );
            const isWrongPair = Boolean(
              result && pairedLeftId && !isCorrectPair,
            );

            return (
              <button
                key={item.id}
                type="button"
                disabled={!isAvailable}
                onClick={() => createPair(item.id)}
                aria-label={`Nối với ${item.text}`}
                className={cn(
                  "flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left text-sm font-black text-slate-700 shadow-[0_3px_0_#e2e8f0] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40 disabled:cursor-default disabled:opacity-100 dark:border-[#202f36] dark:bg-[#141f23] dark:text-slate-200 dark:shadow-[0_3px_0_#0c1214]",
                  isAvailable &&
                    "hover:border-sky-400 hover:bg-sky-50 active:translate-y-px dark:hover:bg-sky-950/20",
                  isLocked &&
                    "cursor-default border-green-400 bg-green-50/70 dark:border-green-900 dark:bg-green-950/20",
                  pairedLeftId &&
                    !result &&
                    "border-sky-300 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/20",
                  isCorrectPair &&
                    "border-green-500 bg-green-50 text-green-700 shadow-[0_3px_0_#22c55e] dark:bg-green-950/20 dark:text-green-300",
                  isLocked &&
                    "cursor-default border-green-400 bg-green-50/70 dark:border-green-900 dark:bg-green-950/20",
                  isWrongPair &&
                    "border-rose-500 bg-rose-50 text-rose-700 shadow-[0_3px_0_#f43f5e] dark:bg-rose-950/20 dark:text-rose-300",
                )}
              >
                <span>{item.text}</span>
                {pairedLeftId ? (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                    {pairNumber}
                  </span>
                ) : (
                  <Link2
                    className="size-4 shrink-0 text-slate-300"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {pairs.length > 0 ? (
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 dark:border-[#202f36] dark:bg-[#141f23]">
          <div className="flex flex-wrap gap-2">
            {pairs.map((pair, index) => {
              const left = exercise.leftItems.find(
                (item) => item.id === pair.leftId,
              );
              const right = exercise.rightItems.find(
                (item) => item.id === pair.rightId,
              );
              return (
                <button
                  key={pair.leftId}
                  type="button"
                  disabled={disabled || lockedLeftIdSet.has(pair.leftId)}
                  onClick={() => removePair(pair.leftId)}
                  aria-label={`Bỏ nối ${left?.text ?? ""} với ${right?.text ?? ""}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 text-xs font-black text-sky-700 transition hover:bg-sky-50 disabled:cursor-default dark:border-sky-900 dark:bg-[#182226] dark:text-sky-300"
                >
                  <span>
                    {index + 1}. {left?.text} → {right?.text}
                  </span>
                  {!disabled ? (
                    <Unlink className="size-4" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {result ? (
        <p
          className={cn(
            "rounded-2xl px-4 py-3 text-sm font-black",
            correctCount === exercise.leftItems.length
              ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300",
          )}
        >
          Bạn đã nối đúng {correctCount}/{exercise.leftItems.length} cặp.
        </p>
      ) : pairs.length > 0 && !disabled ? (
        <Button
          type="button"
          variant="primary-outline"
          onClick={() => {
            onAnswerChange({ type: "match_pairs", pairs: [] });
            setActiveLeftId(null);
          }}
          className="h-11 rounded-2xl px-4 normal-case tracking-normal"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Làm lại các cặp
        </Button>
      ) : null}
    </div>
  );
};
