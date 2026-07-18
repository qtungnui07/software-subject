"use client";

import { Check, Circle, FilePenLine } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  ExerciseCheckResult,
  ShortWritingExercise,
  ShortWritingExerciseAnswer,
} from "@/types/exercise";

type Props = {
  exercise: ShortWritingExercise;
  answer: ShortWritingExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  onAnswerChange: (answer: ShortWritingExerciseAnswer) => void;
};

const countWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const countSentences = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return Math.max(1, trimmed.match(/[.!?]+(?=\s|$)/g)?.length ?? 0);
};

export const ShortWritingExerciseView = ({
  exercise,
  answer,
  disabled,
  result,
  onAnswerChange,
}: Props) => {
  const value = answer?.value ?? "";
  const wordCount = countWords(value);
  const sentenceCount = countSentences(value);
  const normalizedValue = value.toLocaleLowerCase("en-US");
  const matchedWords = exercise.suggestedWords.filter((word) =>
    normalizedValue.includes(word.toLocaleLowerCase("en-US")),
  );
  const minimumSentences = exercise.minimumSentences ?? 1;
  const toleratedMaxWords =
    exercise.maxWords + Math.max(1, Math.floor(exercise.maxWords * 0.2));
  const exceedsRecommendedMaximum = wordCount > exercise.maxWords;
  const isLengthValid =
    wordCount >= exercise.minWords && wordCount <= toleratedMaxWords;
  const hasEnoughKeywords = matchedWords.length >= exercise.minimumSuggestedWordMatches;
  const hasEnoughSentences = sentenceCount >= minimumSentences;

  const criteria = [
    {
      label: `Ít nhất ${exercise.minWords} từ; khuyến nghị tối đa ${exercise.maxWords}`,
      passed: isLengthValid,
    },
    {
      label: `Dùng ít nhất ${exercise.minimumSuggestedWordMatches} từ gợi ý`,
      passed: hasEnoughKeywords,
    },
    {
      label: `Có ít nhất ${minimumSentences} câu hoàn chỉnh`,
      passed: hasEnoughSentences,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black leading-snug text-slate-800 dark:text-slate-100 md:text-2xl">
          {exercise.prompt}
        </h2>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
          {exercise.topic}
        </p>
      </div>

      <div className="rounded-3xl border-2 border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-sky-700/70 dark:text-sky-300/70">
            Từ gợi ý
          </span>
          {exercise.suggestedWords.map((word) => {
            const used = matchedWords.includes(word);
            return (
              <span
                key={word}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 text-xs font-black transition",
                  used
                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/20 dark:text-green-300"
                    : "border-sky-200 bg-white text-sky-700 dark:border-sky-900 dark:bg-[#141f23] dark:text-sky-300",
                )}
              >
                {used ? <Check className="size-3" aria-hidden="true" /> : null}
                {word}
              </span>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor={`${exercise.id}-writing`} className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
          <FilePenLine className="size-4 text-[#1486CC]" aria-hidden="true" />
          Bài viết của bạn
        </label>
        <textarea
          id={`${exercise.id}-writing`}
          value={value}
          disabled={disabled}
          rows={6}
          spellCheck="false"
          onChange={(event) => onAnswerChange({ type: "short_writing", value: event.target.value })}
          placeholder="Viết câu trả lời bằng tiếng Anh..."
          className={cn(
            "min-h-40 w-full resize-y rounded-2xl border-2 bg-white px-4 py-3 text-base font-bold leading-7 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-300/30 disabled:opacity-100 dark:border-[#202f36] dark:bg-[#141f23] dark:text-slate-100 dark:placeholder:text-slate-600",
            result?.isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/20",
            result && !result.isCorrect && "border-amber-500 bg-amber-50 dark:bg-amber-950/20",
          )}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-black">
          <span className={cn(
            wordCount > toleratedMaxWords
              ? "text-rose-600 dark:text-rose-400"
              : exceedsRecommendedMaximum
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-400",
          )}>
            {wordCount}/{exercise.minWords} từ tối thiểu · khuyến nghị tối đa {exercise.maxWords}
          </span>
          <span className={hasEnoughKeywords ? "text-green-600 dark:text-green-400" : "text-slate-400"}>
            Đã dùng {matchedWords.length}/{exercise.minimumSuggestedWordMatches} từ yêu cầu
          </span>
        </div>
      </div>

      {result ? (
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-[#202f36] dark:bg-[#141f23]">
          <p className="mb-3 text-sm font-black text-slate-700 dark:text-slate-200">
            Tiêu chí chấm tự động
          </p>
          <ul className="space-y-2">
            {criteria.map((criterion) => (
              <li key={criterion.label} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                {criterion.passed ? (
                  <span className="flex size-6 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="flex size-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    <Circle className="size-3" aria-hidden="true" />
                  </span>
                )}
                {criterion.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs font-black text-slate-400">
            Điểm tiêu chí: {Math.round(result.scoreRatio * 100)}%
          </p>
        </div>
      ) : null}
    </div>
  );
};
