"use client";

import { Eraser, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ExerciseCheckResult,
  SentenceRewriteExercise,
  SentenceRewriteExerciseAnswer,
} from "@/types/exercise";

type Props = {
  exercise: SentenceRewriteExercise;
  answer: SentenceRewriteExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  onAnswerChange: (answer: SentenceRewriteExerciseAnswer) => void;
};

export const SentenceRewriteExerciseView = ({
  exercise,
  answer,
  disabled,
  result,
  onAnswerChange,
}: Props) => {
  const value = answer?.value ?? "";
  const normalizedValue = value.toLocaleLowerCase("en-US");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black leading-snug text-slate-800 dark:text-slate-100 md:text-2xl">
          {exercise.prompt}
        </h2>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
          Giữ nguyên ý nghĩa của câu và sử dụng đúng từ được yêu cầu.
        </p>
      </div>

      <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-[#202f36] dark:bg-[#141f23] md:p-5">
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">
          Câu gốc
        </p>
        <p className="text-base font-black leading-7 text-slate-800 dark:text-slate-100 md:text-lg">
          {exercise.sourceSentence}
        </p>
      </div>

      {(exercise.requiredWords?.length ?? 0) > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Từ bắt buộc
          </span>
          {exercise.requiredWords?.map((word) => {
            const used = normalizedValue.includes(word.toLocaleLowerCase("en-US"));
            return (
              <span
                key={word}
                className={cn(
                  "rounded-full border-2 px-3 py-1 text-xs font-black",
                  used
                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/20 dark:text-green-300"
                    : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/20 dark:text-sky-300",
                )}
              >
                {word}
              </span>
            );
          })}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={`${exercise.id}-answer`} className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
          <PenLine className="size-4 text-[#1486CC]" aria-hidden="true" />
          Câu viết lại
        </label>
        <textarea
          id={`${exercise.id}-answer`}
          value={value}
          disabled={disabled}
          rows={3}
          spellCheck="false"
          autoComplete="off"
          onChange={(event) => onAnswerChange({ type: "sentence_rewrite", value: event.target.value })}
          placeholder="Nhập câu trả lời bằng tiếng Anh..."
          className={cn(
            "min-h-28 w-full resize-y rounded-2xl border-2 bg-white px-4 py-3 text-base font-bold leading-7 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-300/30 disabled:opacity-100 dark:border-[#202f36] dark:bg-[#141f23] dark:text-slate-100 dark:placeholder:text-slate-600",
            result?.isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/20",
            result && !result.isCorrect && "border-rose-500 bg-rose-50 dark:bg-rose-950/20",
          )}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-400">
            {value.trim().length} ký tự
          </span>
          {!disabled && value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onAnswerChange({ type: "sentence_rewrite", value: "" })}
              className="normal-case tracking-normal text-slate-500"
            >
              <Eraser className="size-4" aria-hidden="true" />
              Xóa nhanh
            </Button>
          ) : null}
        </div>
      </div>

      {result?.isCorrect && result.normalizedUserAnswer !== result.correctAnswerText.toLocaleLowerCase("en-US").replace(/[.!?]+$/g, "") ? (
        <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-black text-green-700 dark:bg-green-950/20 dark:text-green-300">
          Câu của bạn khác cách diễn đạt mẫu nhưng vẫn được chấp nhận.
        </p>
      ) : null}
    </div>
  );
};
