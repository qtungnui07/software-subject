import type {
  PlacementQuestionDefinition,
  PublicPlacementQuestion,
} from "@/types/placement-test";

const getPublicBase = ({ exercise, order }: PlacementQuestionDefinition) => ({
  id: exercise.id,
  type: exercise.type,
  instruction: exercise.instruction,
  prompt: exercise.prompt,
  skill: exercise.skill,
  difficulty: exercise.difficulty,
  order,
});

export const toPublicPlacementQuestion = (
  question: PlacementQuestionDefinition
): PublicPlacementQuestion => {
  const { exercise } = question;
  const base = getPublicBase(question);

  switch (exercise.type) {
    case "multiple_choice":
      return {
        ...base,
        type: exercise.type,
        options: exercise.options.map((option) => ({ ...option })),
      };
    case "arrange_words":
      return {
        ...base,
        type: exercise.type,
        tokens: exercise.tokens.map((token) => ({ ...token })),
      };
    case "fill_blank":
      return {
        ...base,
        type: exercise.type,
        sentenceBefore: exercise.sentenceBefore,
        sentenceAfter: exercise.sentenceAfter,
      };
    case "dialogue_choice":
      return {
        ...base,
        type: exercise.type,
        speaker: exercise.speaker,
        dialogue: exercise.dialogue,
        options: exercise.options.map((option) => ({ ...option })),
      };
    case "listening_choice":
      return {
        ...base,
        type: exercise.type,
        audioSrc: exercise.audioSrc,
        spokenText: exercise.spokenText,
        options: exercise.options.map((option) => ({ ...option })),
      };
  }
};

export const toPublicPlacementQuestions = (
  questions: PlacementQuestionDefinition[]
) => questions.map(toPublicPlacementQuestion);
