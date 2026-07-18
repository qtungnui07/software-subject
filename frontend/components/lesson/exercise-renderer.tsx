"use client";

import { ExerciseContextCard } from "@/components/lesson/exercise-context-card";
import { ExerciseHint } from "@/components/lesson/exercise-hint";
import { ArrangeDialogueExerciseView } from "@/components/lesson/exercises/arrange-dialogue-exercise";
import { ArrangeWordsExerciseView } from "@/components/lesson/exercises/arrange-words-exercise";
import { DialogueChoiceExerciseView } from "@/components/lesson/exercises/dialogue-choice-exercise";
import { FillBlankExerciseView } from "@/components/lesson/exercises/fill-blank-exercise";
import { ListeningChoiceExerciseView } from "@/components/lesson/exercises/listening-choice-exercise";
import { MatchPairsExerciseView } from "@/components/lesson/exercises/match-pairs-exercise";
import { MultipleChoiceExerciseView } from "@/components/lesson/exercises/multiple-choice-exercise";
import { SentenceRewriteExerciseView } from "@/components/lesson/exercises/sentence-rewrite-exercise";
import { ShortWritingExerciseView } from "@/components/lesson/exercises/short-writing-exercise";
import type { AssessmentMode } from "@/types/learning-session-draft";
import type {
  ArrangeDialogueExerciseAnswer,
  ArrangeWordsExerciseAnswer,
  ChoiceExerciseAnswer,
  Exercise,
  ExerciseAnswer,
  ExerciseCheckResult,
  FillBlankExerciseAnswer,
  MatchPairsExerciseAnswer,
  SentenceRewriteExerciseAnswer,
  ShortWritingExerciseAnswer,
} from "@/types/exercise";

type Props = {
  exercise: Exercise;
  answer: ExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  lockedMatchPairLeftIds?: string[];
  hintAvailable?: boolean;
  revealContext?: boolean;
  assessmentMode?: AssessmentMode;
  onAnswerChange: (answer: ExerciseAnswer) => void;
};

export const ExerciseRenderer = ({
  exercise,
  answer,
  disabled,
  result,
  lockedMatchPairLeftIds = [],
  hintAvailable = false,
  revealContext,
  assessmentMode = "standard",
  onAnswerChange,
}: Props) => {
  const exerciseView = (() => {
    switch (exercise.type) {
      case "multiple_choice":
        return (
          <MultipleChoiceExerciseView
            exercise={exercise}
            answer={
              answer?.type === "choice"
                ? (answer as ChoiceExerciseAnswer)
                : null
            }
            disabled={disabled}
            result={result}
            onAnswerChange={onAnswerChange}
          />
        );
      case "dialogue_choice":
        return (
          <DialogueChoiceExerciseView
            exercise={exercise}
            answer={
              answer?.type === "choice"
                ? (answer as ChoiceExerciseAnswer)
                : null
            }
            disabled={disabled}
            result={result}
            onAnswerChange={onAnswerChange}
          />
        );
      case "listening_choice":
        return (
          <ListeningChoiceExerciseView
            exercise={exercise}
            answer={
              answer?.type === "choice"
                ? (answer as ChoiceExerciseAnswer)
                : null
            }
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
            answer={
              answer?.type === "fill_blank"
                ? (answer as FillBlankExerciseAnswer)
                : null
            }
            disabled={disabled}
            result={result}
            onAnswerChange={onAnswerChange}
          />
        );
      case "match_pairs":
        return (
          <MatchPairsExerciseView
            exercise={exercise}
            answer={
              answer?.type === "match_pairs"
                ? (answer as MatchPairsExerciseAnswer)
                : null
            }
            disabled={disabled}
            result={result}
            lockedLeftIds={lockedMatchPairLeftIds}
            onAnswerChange={onAnswerChange}
          />
        );
      case "arrange_dialogue":
        return (
          <ArrangeDialogueExerciseView
            exercise={exercise}
            answer={
              answer?.type === "arrange_dialogue"
                ? (answer as ArrangeDialogueExerciseAnswer)
                : null
            }
            disabled={disabled}
            result={result}
            onAnswerChange={onAnswerChange}
          />
        );
      case "sentence_rewrite":
        return (
          <SentenceRewriteExerciseView
            exercise={exercise}
            answer={
              answer?.type === "sentence_rewrite"
                ? (answer as SentenceRewriteExerciseAnswer)
                : null
            }
            disabled={disabled}
            result={result}
            onAnswerChange={onAnswerChange}
          />
        );
      case "short_writing":
        return (
          <ShortWritingExerciseView
            exercise={exercise}
            answer={
              answer?.type === "short_writing"
                ? (answer as ShortWritingExerciseAnswer)
                : null
            }
            disabled={disabled}
            result={result}
            onAnswerChange={onAnswerChange}
          />
        );
    }
  })();

  return (
    <div className="space-y-5">
      {exercise.context ? (
        <ExerciseContextCard
          context={exercise.context}
          revealed={revealContext ?? result !== null}
          assessmentMode={assessmentMode}
        />
      ) : null}
      {exercise.hint ? (
        <ExerciseHint
          key={exercise.id}
          hint={exercise.hint}
          available={hintAvailable}
        />
      ) : null}
      {exerciseView}
    </div>
  );
};
