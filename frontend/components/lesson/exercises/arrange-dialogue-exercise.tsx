"use client";

import { ArrowDown, ArrowUp, MessageCircleMore, Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  ArrangeDialogueExercise,
  ArrangeDialogueExerciseAnswer,
  ExerciseCheckResult,
} from "@/types/exercise";

type Props = {
  exercise: ArrangeDialogueExercise;
  answer: ArrangeDialogueExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  onAnswerChange: (answer: ArrangeDialogueExerciseAnswer) => void;
};

export const ArrangeDialogueExerciseView = ({
  exercise,
  answer,
  disabled,
  result,
  onAnswerChange,
}: Props) => {
  const selectedIds = answer?.lineIds ?? [];
  const selectedSet = new Set(selectedIds);
  const requiredCount = exercise.correctOrder.length;
  const availableLines = exercise.lines.filter((line) => !selectedSet.has(line.id));

  const updateOrder = (lineIds: string[]) => {
    onAnswerChange({ type: "arrange_dialogue", lineIds });
  };

  const addLine = (lineId: string) => {
    if (disabled || selectedIds.length >= requiredCount) return;
    updateOrder([...selectedIds, lineId]);
  };

  const removeLine = (lineId: string) => {
    if (disabled) return;
    updateOrder(selectedIds.filter((id) => id !== lineId));
  };

  const moveLine = (index: number, direction: -1 | 1) => {
    if (disabled) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    updateOrder(next);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black leading-snug text-slate-800 dark:text-slate-100 md:text-2xl">
          {exercise.prompt}
        </h2>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
          Chọn {requiredCount} câu, sau đó dùng nút lên và xuống để sắp xếp.
        </p>
      </div>

      <section aria-label="Hội thoại đã chọn" className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Hội thoại của bạn
          </p>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
            {selectedIds.length}/{requiredCount}
          </span>
        </div>

        <div className="min-h-28 space-y-3 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 dark:border-[#2b3d45] dark:bg-[#111a1e]">
          {selectedIds.length === 0 ? (
            <div className="flex min-h-20 items-center justify-center gap-2 text-center text-sm font-bold text-slate-400">
              <MessageCircleMore className="size-5" aria-hidden="true" />
              Chọn câu bên dưới để tạo hội thoại.
            </div>
          ) : (
            selectedIds.map((lineId, index) => {
              const line = exercise.lines.find((item) => item.id === lineId);
              if (!line) return null;
              const isCorrectPosition = Boolean(result && exercise.correctOrder[index] === lineId);
              const isWrongPosition = Boolean(result && !isCorrectPosition);

              return (
                <article
                  key={line.id}
                  className={cn(
                    "grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border-2 bg-white p-3 shadow-sm dark:border-[#202f36] dark:bg-[#141f23]",
                    isCorrectPosition && "border-green-500 bg-green-50 dark:bg-green-950/20",
                    isWrongPosition && "border-rose-500 bg-rose-50 dark:bg-rose-950/20",
                  )}
                >
                  <span className="flex size-8 items-center justify-center rounded-xl bg-sky-100 text-xs font-black text-sky-700 dark:bg-sky-900/50 dark:text-sky-300">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-wide text-sky-700 dark:text-sky-300">
                      {line.speaker}
                    </p>
                    <p className="mt-0.5 text-sm font-bold leading-6 text-slate-700 dark:text-slate-200">
                      {line.text}
                    </p>
                  </div>
                  {!disabled ? (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveLine(index, -1)}
                        disabled={index === 0}
                        aria-label={`Đưa câu ${index + 1} lên`}
                        className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 dark:border-[#2c3d45] dark:bg-[#182226] dark:text-slate-300 dark:hover:bg-[#1f2d33]"
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLine(index, 1)}
                        disabled={index === selectedIds.length - 1}
                        aria-label={`Đưa câu ${index + 1} xuống`}
                        className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 dark:border-[#2c3d45] dark:bg-[#182226] dark:text-slate-300 dark:hover:bg-[#1f2d33]"
                      >
                        <ArrowDown className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        aria-label={`Bỏ câu của ${line.speaker}`}
                        className="flex size-11 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 dark:border-rose-950 dark:bg-[#182226] dark:text-rose-400 dark:hover:bg-rose-950/20"
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>

      {availableLines.length > 0 && !disabled ? (
        <section aria-label="Các câu có thể chọn" className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Các câu còn lại
          </p>
          <div className="grid gap-2">
            {availableLines.map((line) => (
              <button
                key={line.id}
                type="button"
                onClick={() => addLine(line.id)}
                disabled={selectedIds.length >= requiredCount}
                aria-label={`Thêm câu của ${line.speaker}`}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-left transition hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#202f36] dark:bg-[#141f23] dark:hover:bg-sky-950/20"
              >
                <Plus className="size-5 shrink-0 text-[#1486CC]" aria-hidden="true" />
                <span>
                  <span className="block text-xs font-black uppercase tracking-wide text-sky-700 dark:text-sky-300">
                    {line.speaker}
                  </span>
                  <span className="mt-0.5 block text-sm font-bold leading-6 text-slate-700 dark:text-slate-200">
                    {line.text}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {result && result.scoreRatio < 1 ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-black text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">
          {Math.round(result.scoreRatio * requiredCount)}/{requiredCount} vị trí đang đúng. Hãy xem thứ tự mẫu trong phần phản hồi.
        </p>
      ) : null}
    </div>
  );
};
