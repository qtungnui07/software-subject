"use client";

import { PlacementArrangeQuestion } from "@/components/placement-test/placement-arrange-question";
import { PlacementChoiceQuestion } from "@/components/placement-test/placement-choice-question";
import { PlacementDialogueQuestion } from "@/components/placement-test/placement-dialogue-question";
import { PlacementFillBlankQuestion } from "@/components/placement-test/placement-fill-blank-question";
import { PlacementListeningQuestion } from "@/components/placement-test/placement-listening-question";
import type {
  ArrangeWordsExerciseAnswer,
  ChoiceExerciseAnswer,
  ExerciseAnswer,
  FillBlankExerciseAnswer,
} from "@/types/exercise";
import type { PublicPlacementQuestion } from "@/types/placement-test";

type Props = {
  question: PublicPlacementQuestion;
  answer: ExerciseAnswer | null;
  onAnswerChange: (answer: ExerciseAnswer) => void;
};

export const PlacementQuestionRenderer = ({
  question,
  answer,
  onAnswerChange,
}: Props) => {
  switch (question.type) {
    case "multiple_choice":
      return (
        <PlacementChoiceQuestion
          prompt={question.prompt}
          options={question.options}
          answer={answer?.type === "choice" ? (answer as ChoiceExerciseAnswer) : null}
          onAnswerChange={onAnswerChange}
        />
      );
    case "arrange_words":
      return (
        <PlacementArrangeQuestion
          prompt={question.prompt}
          tokens={question.tokens}
          answer={
            answer?.type === "arrange_words"
              ? (answer as ArrangeWordsExerciseAnswer)
              : null
          }
          onAnswerChange={onAnswerChange}
        />
      );
    case "fill_blank":
      return (
        <PlacementFillBlankQuestion
          prompt={question.prompt}
          sentenceBefore={question.sentenceBefore}
          sentenceAfter={question.sentenceAfter}
          answer={
            answer?.type === "fill_blank"
              ? (answer as FillBlankExerciseAnswer)
              : null
          }
          onAnswerChange={onAnswerChange}
        />
      );
    case "dialogue_choice":
      return (
        <PlacementDialogueQuestion
          prompt={question.prompt}
          speaker={question.speaker}
          dialogue={question.dialogue}
          options={question.options}
          answer={answer?.type === "choice" ? (answer as ChoiceExerciseAnswer) : null}
          onAnswerChange={onAnswerChange}
        />
      );
    case "listening_choice":
      return (
        <PlacementListeningQuestion
          prompt={question.prompt}
          audioSrc={question.audioSrc}
          spokenText={question.spokenText}
          options={question.options}
          answer={answer?.type === "choice" ? (answer as ChoiceExerciseAnswer) : null}
          onAnswerChange={onAnswerChange}
        />
      );
  }
};
