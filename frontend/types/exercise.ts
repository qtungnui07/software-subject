export type ExerciseSkill =
  | "vocabulary"
  | "grammar"
  | "listening"
  | "reading"
  | "conversation";

export type ExerciseDifficulty = 1 | 2 | 3;

export type ExerciseType =
  | "multiple_choice"
  | "arrange_words"
  | "fill_blank"
  | "dialogue_choice"
  | "listening_choice";

export type ChoiceOption = {
  id: string;
  text: string;
};

export type ArrangeWordToken = {
  id: string;
  text: string;
};

type BaseExercise = {
  id: string;
  lessonId: string;
  type: ExerciseType;
  instruction: string;
  prompt: string;
  skill: ExerciseSkill;
  difficulty: ExerciseDifficulty;
  explanation?: string;
};

export type MultipleChoiceExercise = BaseExercise & {
  type: "multiple_choice";
  options: ChoiceOption[];
  correctOptionId: string;
};

export type ArrangeWordsExercise = BaseExercise & {
  type: "arrange_words";
  tokens: ArrangeWordToken[];
  correctOrder: string[];
};

export type FillBlankExercise = BaseExercise & {
  type: "fill_blank";
  sentenceBefore: string;
  sentenceAfter: string;
  acceptedAnswers: string[];
  caseSensitive?: boolean;
};

export type DialogueChoiceExercise = BaseExercise & {
  type: "dialogue_choice";
  speaker: string;
  dialogue: string;
  options: ChoiceOption[];
  correctOptionId: string;
};

export type ListeningChoiceExercise = BaseExercise & {
  type: "listening_choice";
  audioSrc?: string;
  spokenText?: string;
  options: ChoiceOption[];
  correctOptionId: string;
};

export type Exercise =
  | MultipleChoiceExercise
  | ArrangeWordsExercise
  | FillBlankExercise
  | DialogueChoiceExercise
  | ListeningChoiceExercise;

export type ChoiceExerciseAnswer = {
  type: "choice";
  optionId: string;
};

export type ArrangeWordsExerciseAnswer = {
  type: "arrange_words";
  tokenIds: string[];
};

export type FillBlankExerciseAnswer = {
  type: "fill_blank";
  value: string;
};

export type ExerciseAnswer =
  | ChoiceExerciseAnswer
  | ArrangeWordsExerciseAnswer
  | FillBlankExerciseAnswer;

export type ExerciseCheckResult = {
  isCorrect: boolean;
  correctAnswerText: string;
  normalizedUserAnswer: string;
  explanation?: string;
};
