"use client";

import { MessageCircle } from "lucide-react";

import { MultipleChoiceExerciseView } from "@/components/lesson/exercises/multiple-choice-exercise";
import type {
  ChoiceExerciseAnswer,
  DialogueChoiceExercise,
  ExerciseCheckResult,
  MultipleChoiceExercise,
} from "@/types/exercise";

type Props = {
  exercise: DialogueChoiceExercise;
  answer: ChoiceExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  onAnswerChange: (answer: ChoiceExerciseAnswer) => void;
};

export const DialogueChoiceExerciseView = ({
  exercise,
  answer,
  disabled,
  result,
  onAnswerChange,
}: Props) => {
  const choiceExercise: MultipleChoiceExercise = {
    ...exercise,
    type: "multiple_choice",
    prompt: exercise.prompt,
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 dark:border-violet-900/60 dark:bg-violet-950/20">
        <div className="mb-2 flex items-center gap-2 text-sm font-black text-violet-700 dark:text-violet-300">
          <MessageCircle className="size-4" />
          {exercise.speaker}
        </div>
        <p className="text-lg font-black leading-relaxed text-slate-800 dark:text-slate-100">
          “{exercise.dialogue}”
        </p>
      </div>

      <MultipleChoiceExerciseView
        exercise={choiceExercise}
        answer={answer}
        disabled={disabled}
        result={result}
        onAnswerChange={onAnswerChange}
      />
    </div>
  );
};
