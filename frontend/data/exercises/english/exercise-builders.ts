import type {
  ArrangeDialogueExercise,
  ArrangeWordsExercise,
  DialogueChoiceExercise,
  ExerciseContext,
  ExerciseDifficulty,
  ExerciseSkill,
  FillBlankExercise,
  ListeningChoiceExercise,
  MatchPairsExercise,
  MultipleChoiceExercise,
  SentenceRewriteExercise,
  ShortWritingExercise,
} from "@/types/exercise";

type BaseExerciseInput = {
  id: string;
  lessonId: string;
  skill: ExerciseSkill;
  difficulty: ExerciseDifficulty;
  instruction: string;
  prompt: string;
  explanation?: string;
  hint?: string;
  context?: ExerciseContext;
  contentVersion?: number;
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

const validateIndexOrder = (
  exerciseId: string,
  order: number[],
  itemCount: number,
  label: string
) => {
  const expectedIndexes = Array.from({ length: itemCount }, (_, index) => index);
  const normalizedOrder = [...order].sort((left, right) => left - right);

  if (
    order.length !== itemCount ||
    normalizedOrder.some((value, index) => value !== expectedIndexes[index])
  ) {
    throw new Error(`${exerciseId} has an invalid ${label} order.`);
  }
};

const getBaseExercise = (input: BaseExerciseInput) => ({
  id: input.id,
  lessonId: input.lessonId,
  skill: input.skill,
  difficulty: input.difficulty,
  instruction: input.instruction,
  prompt: input.prompt,
  explanation: input.explanation,
  hint: input.hint,
  context: input.context,
  contentVersion: input.contentVersion,
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

  validateIndexOrder(
    input.id,
    input.shuffledOrder,
    input.wordsInCorrectOrder.length,
    "shuffled token"
  );

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

export const createMatchPairsExercise = (
  input: BaseExerciseInput & {
    pairs: Array<readonly [leftText: string, rightText: string]>;
    shuffledRightOrder: number[];
  }
): MatchPairsExercise => {
  validateIndexOrder(
    input.id,
    input.shuffledRightOrder,
    input.pairs.length,
    "shuffled right item"
  );

  const leftItems = input.pairs.map(([text], index) => ({
    id: `${input.id}-left-${index + 1}`,
    text,
  }));
  const rightItemsInCorrectOrder = input.pairs.map(([, text], index) => ({
    id: `${input.id}-right-${index + 1}`,
    text,
  }));

  return {
    ...getBaseExercise(input),
    type: "match_pairs",
    leftItems,
    rightItems: input.shuffledRightOrder.map(
      (rightIndex) => rightItemsInCorrectOrder[rightIndex]
    ),
    correctPairs: input.pairs.map((_, index) => ({
      leftId: leftItems[index].id,
      rightId: rightItemsInCorrectOrder[index].id,
    })),
  };
};

export const createArrangeDialogueExercise = (
  input: BaseExerciseInput & {
    linesInCorrectOrder: Array<{
      speaker: string;
      text: string;
    }>;
    distractorLines?: Array<{
      speaker: string;
      text: string;
    }>;
    shuffledOrder: number[];
  }
): ArrangeDialogueExercise => {
  const correctLines = input.linesInCorrectOrder.map((line, index) => ({
    id: `${input.id}-line-${index + 1}`,
    ...line,
  }));
  const distractorLines = (input.distractorLines ?? []).map((line, index) => ({
    id: `${input.id}-distractor-${index + 1}`,
    ...line,
  }));
  const allLines = [...correctLines, ...distractorLines];

  validateIndexOrder(
    input.id,
    input.shuffledOrder,
    allLines.length,
    "shuffled dialogue"
  );

  return {
    ...getBaseExercise(input),
    type: "arrange_dialogue",
    lines: input.shuffledOrder.map((lineIndex) => allLines[lineIndex]),
    correctOrder: correctLines.map((line) => line.id),
  };
};

export const createSentenceRewriteExercise = (
  input: BaseExerciseInput & {
    sourceSentence: string;
    requiredWords?: string[];
    acceptedAnswers: string[];
    caseSensitive?: boolean;
  }
): SentenceRewriteExercise => ({
  ...getBaseExercise(input),
  type: "sentence_rewrite",
  sourceSentence: input.sourceSentence,
  requiredWords: input.requiredWords,
  acceptedAnswers: input.acceptedAnswers,
  caseSensitive: input.caseSensitive,
});

export const createShortWritingExercise = (
  input: BaseExerciseInput & {
    topic: string;
    minWords: number;
    maxWords: number;
    suggestedWords: string[];
    minimumSuggestedWordMatches: number;
    minimumSentences?: number;
    requiredPhraseOrder?: string[];
    requiredContentGroups?: ShortWritingExercise["requiredContentGroups"];
    sampleAnswer: string;
  }
): ShortWritingExercise => ({
  ...getBaseExercise(input),
  type: "short_writing",
  topic: input.topic,
  minWords: input.minWords,
  maxWords: input.maxWords,
  suggestedWords: input.suggestedWords,
  minimumSuggestedWordMatches: input.minimumSuggestedWordMatches,
  minimumSentences: input.minimumSentences,
  requiredPhraseOrder: input.requiredPhraseOrder,
  requiredContentGroups: input.requiredContentGroups,
  sampleAnswer: input.sampleAnswer,
});
