"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  ArrangeWordToken,
  ArrangeWordsExerciseAnswer,
} from "@/types/exercise";

type Props = {
  prompt: string;
  tokens: ArrangeWordToken[];
  answer: ArrangeWordsExerciseAnswer | null;
  onAnswerChange: (answer: ArrangeWordsExerciseAnswer) => void;
};

export const PlacementArrangeQuestion = ({
  prompt,
  tokens,
  answer,
  onAnswerChange,
}: Props) => {
  const selectedIds = answer?.tokenIds ?? [];
  const selectedTokens = selectedIds
    .map((tokenId) => tokens.find((token) => token.id === tokenId))
    .filter((token): token is ArrangeWordToken => Boolean(token));
  const availableTokens = tokens.filter((token) => !selectedIds.includes(token.id));

  const addToken = (tokenId: string) =>
    onAnswerChange({ type: "arrange_words", tokenIds: [...selectedIds, tokenId] });

  const removeToken = (tokenId: string) =>
    onAnswerChange({
      type: "arrange_words",
      tokenIds: selectedIds.filter((id) => id !== tokenId),
    });

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-black leading-snug text-slate-800 dark:text-slate-100 sm:text-2xl">
        {prompt}
      </h2>

      <div className="min-h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 dark:border-[#31464f] dark:bg-[#121d21]">
        {selectedTokens.length ? (
          <div className="flex flex-wrap gap-2">
            {selectedTokens.map((token) => (
              <button
                key={token.id}
                type="button"
                onClick={() => removeToken(token.id)}
                className="rounded-xl border-2 border-sky-400 bg-sky-100 px-3 py-2 font-black text-sky-800 shadow-[0_3px_0_#38bdf8] transition active:translate-y-0.5 dark:border-sky-600 dark:bg-sky-950/50 dark:text-sky-200 dark:shadow-[0_3px_0_#0369a1]"
              >
                {token.text}
              </button>
            ))}
          </div>
        ) : (
          <p className="py-3 text-center text-sm font-bold text-slate-400 dark:text-slate-500">
            Chọn các từ bên dưới để tạo câu.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTokens.map((token) => (
          <button
            key={token.id}
            type="button"
            onClick={() => addToken(token.id)}
            className={cn(
              "rounded-xl border-2 border-slate-300 bg-white px-3 py-2 font-black text-slate-700 shadow-[0_3px_0_#cbd5e1] transition hover:-translate-y-0.5 active:translate-y-0 dark:border-[#31464f] dark:bg-[#1b292f] dark:text-slate-200 dark:shadow-[0_3px_0_#0b1114] motion-reduce:transform-none"
            )}
          >
            {token.text}
          </button>
        ))}
      </div>

      {selectedIds.length ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onAnswerChange({ type: "arrange_words", tokenIds: [] })}
          className="h-10 px-3 text-slate-500"
        >
          <RotateCcw className="size-4" /> Làm lại
        </Button>
      ) : null}
    </div>
  );
};
