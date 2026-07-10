"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ArrangeWordsExercise,
  ArrangeWordsExerciseAnswer,
  ExerciseCheckResult,
} from "@/types/exercise";

type Props = {
  exercise: ArrangeWordsExercise;
  answer: ArrangeWordsExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  onAnswerChange: (answer: ArrangeWordsExerciseAnswer) => void;
};

export const ArrangeWordsExerciseView = ({
  exercise,
  answer,
  disabled,
  result,
  onAnswerChange,
}: Props) => {
  const selectedTokenIds = answer?.tokenIds ?? [];
  const tokenById = new Map(exercise.tokens.map((token) => [token.id, token]));
  const availableTokens = exercise.tokens.filter(
    (token) => !selectedTokenIds.includes(token.id)
  );

  const appendToken = (tokenId: string) => {
    if (disabled || selectedTokenIds.includes(tokenId)) return;
    onAnswerChange({ type: "arrange_words", tokenIds: [...selectedTokenIds, tokenId] });
  };

  const removeToken = (tokenId: string) => {
    if (disabled) return;
    onAnswerChange({
      type: "arrange_words",
      tokenIds: selectedTokenIds.filter((selectedId) => selectedId !== tokenId),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black leading-snug text-slate-800 dark:text-slate-100 md:text-2xl">
          {exercise.prompt}
        </h2>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
          Chạm vào từng thẻ theo đúng thứ tự. Chạm lại vào thẻ đã chọn để đưa nó trở về.
        </p>
      </div>

      <div
        className={cn(
          "min-h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 dark:border-[#2a3c44] dark:bg-[#141f23]",
          result?.isCorrect && "border-green-400 bg-green-50 dark:border-green-800 dark:bg-green-950/20",
          result && !result.isCorrect && "border-rose-400 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/20"
        )}
      >
        {selectedTokenIds.length === 0 ? (
          <p className="py-3 text-center text-sm font-bold text-slate-400">
            Câu trả lời của bạn sẽ xuất hiện ở đây
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedTokenIds.map((tokenId) => {
              const token = tokenById.get(tokenId);
              if (!token) return null;

              return (
                <button
                  key={token.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => removeToken(token.id)}
                  className="rounded-xl border-2 border-sky-400 bg-sky-100 px-3 py-2 text-sm font-black text-sky-700 shadow-[0_3px_0_#38bdf8] transition active:translate-y-0.5 active:shadow-none disabled:cursor-default dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300 dark:shadow-[0_3px_0_#0369a1]"
                >
                  {token.text}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex min-h-20 flex-wrap content-start gap-2">
        {availableTokens.map((token) => (
          <button
            key={token.id}
            type="button"
            disabled={disabled}
            onClick={() => appendToken(token.id)}
            className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 shadow-[0_3px_0_#cbd5e1] transition hover:bg-slate-50 active:translate-y-0.5 active:shadow-none disabled:cursor-default dark:border-[#2a3c44] dark:bg-[#182226] dark:text-slate-200 dark:shadow-[0_3px_0_#0c1214] dark:hover:bg-[#1f2d33]"
          >
            {token.text}
          </button>
        ))}
      </div>

      {!disabled && selectedTokenIds.length > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onAnswerChange({ type: "arrange_words", tokenIds: [] })}
          className="px-3 text-slate-500"
        >
          <RotateCcw className="size-4" />
          Làm lại
        </Button>
      ) : null}
    </div>
  );
};
