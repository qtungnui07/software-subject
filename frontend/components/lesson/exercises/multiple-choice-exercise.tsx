"use client";

import { cn } from "@/lib/utils";
import type {
  ChoiceExerciseAnswer,
  ExerciseCheckResult,
  MultipleChoiceExercise,
} from "@/types/exercise";

type Props = {
  exercise: MultipleChoiceExercise;
  answer: ChoiceExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  onAnswerChange: (answer: ChoiceExerciseAnswer) => void;
};

export const MultipleChoiceExerciseView = ({
  exercise,
  answer,
  disabled,
  result,
  onAnswerChange,
}: Props) => (
  <div className="space-y-5">
    <h2 className="text-xl font-black leading-snug text-slate-800 dark:text-slate-100 md:text-2xl">
      {exercise.prompt}
    </h2>

    <div className="grid gap-3">
      {exercise.options.map((option, index) => {
        const isSelected = answer?.optionId === option.id;
        const isCorrectOption = option.id === exercise.correctOptionId;
        const isWrongSelection = Boolean(result && isSelected && !result.isCorrect);

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => onAnswerChange({ type: "choice", optionId: option.id })}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left font-bold text-slate-600 shadow-[0_4px_0_#e2e8f0] transition active:scale-[0.99] dark:border-[#202f36] dark:bg-[#141f23] dark:text-slate-200 dark:shadow-[0_4px_0_#0c1214]",
              !disabled && "hover:bg-slate-50 dark:hover:bg-[#1f2d33]",
              isSelected &&
                "border-sky-500 bg-sky-50 text-sky-600 shadow-[0_4px_0_#0ea5e9] dark:border-sky-500 dark:bg-sky-950/20 dark:text-sky-400 dark:shadow-[0_4px_0_#0284c7]",
              result &&
                isCorrectOption &&
                "border-green-500 bg-green-50 text-green-600 shadow-[0_4px_0_#22c55e] dark:border-green-500 dark:bg-green-950/20 dark:text-green-400 dark:shadow-[0_4px_0_#15803d]",
              isWrongSelection &&
                "border-rose-500 bg-rose-50 text-rose-600 shadow-[0_4px_0_#f43f5e] dark:border-rose-500 dark:bg-rose-950/20 dark:text-rose-400 dark:shadow-[0_4px_0_#b91c1c]"
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-xs font-extrabold text-slate-500 dark:border-[#202f36] dark:bg-slate-800 dark:text-slate-400",
                isSelected &&
                  "border-sky-400 bg-sky-200 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
                result &&
                  isCorrectOption &&
                  "border-green-400 bg-green-200 text-green-700 dark:bg-green-900/50 dark:text-green-300",
                isWrongSelection &&
                  "border-rose-400 bg-rose-200 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
              )}
            >
              {index + 1}
            </span>
            <span className="text-sm leading-snug md:text-base">{option.text}</span>
          </button>
        );
      })}
    </div>
  </div>
);
