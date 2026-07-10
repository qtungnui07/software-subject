"use client";

import { cn } from "@/lib/utils";
import type {
  ExerciseCheckResult,
  FillBlankExercise,
  FillBlankExerciseAnswer,
} from "@/types/exercise";

type Props = {
  exercise: FillBlankExercise;
  answer: FillBlankExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  onAnswerChange: (answer: FillBlankExerciseAnswer) => void;
};

export const FillBlankExerciseView = ({
  exercise,
  answer,
  disabled,
  result,
  onAnswerChange,
}: Props) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-black leading-snug text-slate-800 dark:text-slate-100 md:text-2xl">
        {exercise.prompt}
      </h2>
      <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
        Có thể nhập chữ hoa hoặc chữ thường. Khoảng trắng thừa sẽ được bỏ qua.
      </p>
    </div>

    <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 p-5 text-lg font-black text-slate-800 dark:border-[#202f36] dark:bg-[#141f23] dark:text-slate-100 md:text-xl">
      <span>{exercise.sentenceBefore}</span>
      <input
        autoFocus
        type="text"
        value={answer?.value ?? ""}
        disabled={disabled}
        aria-label="Từ cần điền"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) =>
          onAnswerChange({ type: "fill_blank", value: event.target.value })
        }
        className={cn(
          "h-12 min-w-36 flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 text-center font-black text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:opacity-100 dark:border-[#2a3c44] dark:bg-[#182226] dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-950/40",
          result?.isCorrect && "border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-950/20",
          result && !result.isCorrect && "border-rose-500 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/20"
        )}
      />
      <span>{exercise.sentenceAfter}</span>
    </div>
  </div>
);
