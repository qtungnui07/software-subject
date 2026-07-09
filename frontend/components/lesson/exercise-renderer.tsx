"use client";

import { ArrangeWordsExerciseView } from "@/components/lesson/exercises/arrange-words-exercise";
import { DialogueChoiceExerciseView } from "@/components/lesson/exercises/dialogue-choice-exercise";
import { FillBlankExerciseView } from "@/components/lesson/exercises/fill-blank-exercise";
import { ListeningChoiceExerciseView } from "@/components/lesson/exercises/listening-choice-exercise";
import { MultipleChoiceExerciseView } from "@/components/lesson/exercises/multiple-choice-exercise";
import type {
  ArrangeWordsExerciseAnswer,
  ChoiceExerciseAnswer,
  Exercise,
  ExerciseAnswer,
  ExerciseCheckResult,
  FillBlankExerciseAnswer,
} from "@/types/exercise";

type Props = {
  exercise: Exercise;
  answer: ExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  onAnswerChange: (answer: ExerciseAnswer) => void;
};

export const ExerciseRenderer = ({
  exercise,
  answer,
  disabled,
  result,
  onAnswerChange,
}: Props) => {
  switch (exercise.type) {
    case "multiple_choice":
      return (
        <MultipleChoiceExerciseView
          exercise={exercise}
          answer={answer?.type === "choice" ? (answer as ChoiceExerciseAnswer) : null}
          disabled={disabled}
          result={result}
          onAnswerChange={onAnswerChange}
        />
      );
    case "dialogue_choice":
      return (
        <DialogueChoiceExerciseView
          exercise={exercise}
          answer={answer?.type === "choice" ? (answer as ChoiceExerciseAnswer) : null}
          disabled={disabled}
          result={result}
          onAnswerChange={onAnswerChange}
        />
      );
    case "listening_choice":
      return (
        <ListeningChoiceExerciseView
          exercise={exercise}
          answer={answer?.type === "choice" ? (answer as ChoiceExerciseAnswer) : null}
          disabled={disabled}
          result={result}
          onAnswerChange={onAnswerChange}
        />
      );
    case "arrange_words":
      return (
        <ArrangeWordsExerciseView
          exercise={exercise}
          answer={
            answer?.type === "arrange_words"
              ? (answer as ArrangeWordsExerciseAnswer)
              : null
          }
          disabled={disabled}
          result={result}
          onAnswerChange={onAnswerChange}
        />
      );
    case "fill_blank":
      return (
        <FillBlankExerciseView
          exercise={exercise}
          answer={answer?.type === "fill_blank" ? (answer as FillBlankExerciseAnswer) : null}
          disabled={disabled}
          result={result}
          onAnswerChange={onAnswerChange}
        />
      );
  }
};
