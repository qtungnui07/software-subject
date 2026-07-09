"use client";

import { cn } from "@/lib/utils";
import type { ChoiceExerciseAnswer, ChoiceOption } from "@/types/exercise";

type Props = {
  prompt: string;
  options: ChoiceOption[];
  answer: ChoiceExerciseAnswer | null;
  onAnswerChange: (answer: ChoiceExerciseAnswer) => void;
};

export const PlacementChoiceQuestion = ({
  prompt,
  options,
  answer,
  onAnswerChange,
}: Props) => (
  <div className="space-y-5">
    <h2 className="text-xl font-black leading-snug text-slate-800 dark:text-slate-100 sm:text-2xl">
      {prompt}
    </h2>
    <div className="grid gap-3">
      {options.map((option, index) => {
        const selected = answer?.optionId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onAnswerChange({ type: "choice", optionId: option.id })}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left font-bold text-slate-600 shadow-[0_4px_0_#e2e8f0] transition hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 dark:border-[#263840] dark:bg-[#172328] dark:text-slate-200 dark:shadow-[0_4px_0_#0b1114] dark:hover:bg-[#1d2c32] motion-reduce:transform-none",
              selected &&
                "border-sky-500 bg-sky-50 text-sky-700 shadow-[0_4px_0_#0ea5e9] dark:border-sky-500 dark:bg-sky-950/30 dark:text-sky-300 dark:shadow-[0_4px_0_#0284c7]"
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-xs font-black text-slate-500 dark:border-[#31464f] dark:bg-[#223138] dark:text-slate-400",
                selected &&
                  "border-sky-400 bg-sky-200 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200"
              )}
            >
              {index + 1}
            </span>
            <span className="text-sm leading-relaxed sm:text-base">{option.text}</span>
          </button>
        );
      })}
    </div>
  </div>
);
