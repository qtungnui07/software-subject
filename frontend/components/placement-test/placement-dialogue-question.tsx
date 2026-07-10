"use client";

import { MessageCircleMore } from "lucide-react";

import { PlacementChoiceQuestion } from "@/components/placement-test/placement-choice-question";
import type { ChoiceExerciseAnswer, ChoiceOption } from "@/types/exercise";

type Props = {
  prompt: string;
  speaker: string;
  dialogue: string;
  options: ChoiceOption[];
  answer: ChoiceExerciseAnswer | null;
  onAnswerChange: (answer: ChoiceExerciseAnswer) => void;
};

export const PlacementDialogueQuestion = ({
  prompt,
  speaker,
  dialogue,
  options,
  answer,
  onAnswerChange,
}: Props) => (
  <div className="space-y-5">
    <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-5 dark:border-violet-900/60 dark:bg-violet-950/20">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-violet-600 dark:text-violet-300">
        <MessageCircleMore className="size-4" /> {speaker}
      </div>
      <p className="text-lg font-black leading-relaxed text-slate-800 dark:text-slate-100">
        “{dialogue}”
      </p>
    </div>
    <PlacementChoiceQuestion
      prompt={prompt}
      options={options}
      answer={answer}
      onAnswerChange={onAnswerChange}
    />
  </div>
);
