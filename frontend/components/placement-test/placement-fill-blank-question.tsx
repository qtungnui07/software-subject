"use client";

import type { FillBlankExerciseAnswer } from "@/types/exercise";

type Props = {
  prompt: string;
  sentenceBefore: string;
  sentenceAfter: string;
  answer: FillBlankExerciseAnswer | null;
  onAnswerChange: (answer: FillBlankExerciseAnswer) => void;
};

export const PlacementFillBlankQuestion = ({
  prompt,
  sentenceBefore,
  sentenceAfter,
  answer,
  onAnswerChange,
}: Props) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-black leading-snug text-slate-800 dark:text-slate-100 sm:text-2xl">
        {prompt}
      </h2>
      <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
        Nhập đáp án phù hợp vào ô trống.
      </p>
    </div>
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 p-5 text-lg font-black text-slate-800 dark:border-[#263840] dark:bg-[#121d21] dark:text-slate-100 sm:text-xl">
      <span>{sentenceBefore}</span>
      <input
        autoFocus
        type="text"
        value={answer?.value ?? ""}
        aria-label="Đáp án điền vào chỗ trống"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) =>
          onAnswerChange({ type: "fill_blank", value: event.target.value })
        }
        className="h-12 min-w-36 flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 text-center font-black text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 dark:border-[#31464f] dark:bg-[#1b292f] dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-950/40"
      />
      <span>{sentenceAfter}</span>
    </div>
  </div>
);
