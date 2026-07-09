import type {
  ArrangeWordsExercise,
  DialogueChoiceExercise,
  ExerciseDifficulty,
  ExerciseSkill,
  FillBlankExercise,
  ListeningChoiceExercise,
  MultipleChoiceExercise,
} from "@/types/exercise";

type BaseExerciseInput = {
  id: string;
  lessonId: string;
  skill: ExerciseSkill;
  difficulty: ExerciseDifficulty;
  instruction: string;
  prompt: string;
  explanation?: string;
};

type ChoiceInput = BaseExerciseInput & {
  options: string[];
  correctIndex: number;
};

const createOptions = (exerciseId: string, values: string[]) =>
  values.map((text, index) => ({
    id: `${exerciseId}-option-${index + 1}`,
    text,
  }));

const getCorrectOptionId = (
  exerciseId: string,
  options: ReturnType<typeof createOptions>,
  correctIndex: number
) => {
  const correctOption = options[correctIndex];

  if (!correctOption) {
    throw new Error(`${exerciseId} has an invalid correct option index.`);
  }

  return correctOption.id;
};

const getBaseExercise = (input: BaseExerciseInput) => ({
  id: input.id,
  lessonId: input.lessonId,
  skill: input.skill,
  difficulty: input.difficulty,
  instruction: input.instruction,
  prompt: input.prompt,
  explanation: input.explanation,
});

export const createMultipleChoiceExercise = (
  input: ChoiceInput
): MultipleChoiceExercise => {
  const options = createOptions(input.id, input.options);

  return {
    ...getBaseExercise(input),
    type: "multiple_choice",
    options,
    correctOptionId: getCorrectOptionId(input.id, options, input.correctIndex),
  };
};

export const createDialogueChoiceExercise = (
  input: ChoiceInput & {
    speaker: string;
    dialogue: string;
  }
): DialogueChoiceExercise => {
  const options = createOptions(input.id, input.options);

  return {
    ...getBaseExercise(input),
    type: "dialogue_choice",
    speaker: input.speaker,
    dialogue: input.dialogue,
    options,
    correctOptionId: getCorrectOptionId(input.id, options, input.correctIndex),
  };
};

export const createListeningChoiceExercise = (
  input: ChoiceInput & {
    audioSrc?: string;
    spokenText?: string;
  }
): ListeningChoiceExercise => {
  const options = createOptions(input.id, input.options);

  return {
    ...getBaseExercise(input),
    type: "listening_choice",
    audioSrc: input.audioSrc,
    spokenText: input.spokenText,
    options,
    correctOptionId: getCorrectOptionId(input.id, options, input.correctIndex),
  };
};

export const createArrangeWordsExercise = (
  input: BaseExerciseInput & {
    wordsInCorrectOrder: string[];
    shuffledOrder: number[];
  }
): ArrangeWordsExercise => {
  const tokenIds = input.wordsInCorrectOrder.map(
    (_, index) => `${input.id}-token-${index + 1}`
  );
  const expectedIndexes = input.wordsInCorrectOrder.map((_, index) => index);
  const normalizedOrder = [...input.shuffledOrder].sort((left, right) => left - right);

  if (
    input.shuffledOrder.length !== expectedIndexes.length ||
    normalizedOrder.some((value, index) => value !== expectedIndexes[index])
  ) {
    throw new Error(`${input.id} has an invalid shuffled token order.`);
  }

  return {
    ...getBaseExercise(input),
    type: "arrange_words",
    tokens: input.shuffledOrder.map((wordIndex) => ({
      id: tokenIds[wordIndex],
      text: input.wordsInCorrectOrder[wordIndex],
    })),
    correctOrder: tokenIds,
  };
};

export const createFillBlankExercise = (
  input: BaseExerciseInput & {
    sentenceBefore: string;
    sentenceAfter: string;
    acceptedAnswers: string[];
    caseSensitive?: boolean;
  }
): FillBlankExercise => ({
  ...getBaseExercise(input),
  type: "fill_blank",
  sentenceBefore: input.sentenceBefore,
  sentenceAfter: input.sentenceAfter,
  acceptedAnswers: input.acceptedAnswers,
  caseSensitive: input.caseSensitive,
});
