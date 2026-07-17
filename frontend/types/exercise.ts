export type ExerciseSkill =
  "vocabulary" | "grammar" | "listening" | "reading" | "conversation";

export type ExerciseDifficulty = 1 | 2 | 3;

export type CoreExerciseType =
  | "multiple_choice"
  | "arrange_words"
  | "fill_blank"
  | "dialogue_choice"
  | "listening_choice";

export type ExtendedExerciseType =
  "match_pairs" | "arrange_dialogue" | "sentence_rewrite" | "short_writing";

export type ExerciseType = CoreExerciseType | ExtendedExerciseType;

export type ChoiceOption = {
  id: string;
  text: string;
};

export type ArrangeWordToken = {
  id: string;
  text: string;
};

export type MatchPairItem = {
  id: string;
  text: string;
};

export type MatchPair = {
  leftId: string;
  rightId: string;
};

export type DialogueLine = {
  id: string;
  speaker: string;
  text: string;
};

export type ReadingExerciseContext = {
  id: string;
  kind: "reading";
  title: string;
  text: string;
};

export type ListeningExerciseContext = {
  id: string;
  kind: "listening";
  title: string;
  audioSrc?: string;
  spokenText?: string;
  silentAlternative?: string;
  transcriptAfterSubmit?: string;
};

export type ScenarioExerciseContext = {
  id: string;
  kind: "scenario";
  title: string;
  description: string;
};

export type ExerciseContext =
  ReadingExerciseContext | ListeningExerciseContext | ScenarioExerciseContext;

export type BaseExercise = {
  id: string;
  lessonId: string;
  type: ExerciseType;
  instruction: string;
  prompt: string;
  skill: ExerciseSkill;
  difficulty: ExerciseDifficulty;
  explanation?: string;
  hint?: string;
  context?: ExerciseContext;
  contentVersion?: number;
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

export type MatchPairsExercise = BaseExercise & {
  type: "match_pairs";
  leftItems: MatchPairItem[];
  rightItems: MatchPairItem[];
  correctPairs: MatchPair[];
};

export type ArrangeDialogueExercise = BaseExercise & {
  type: "arrange_dialogue";
  lines: DialogueLine[];
  correctOrder: string[];
};

export type SentenceRewriteExercise = BaseExercise & {
  type: "sentence_rewrite";
  sourceSentence: string;
  requiredWords?: string[];
  acceptedAnswers: string[];
  caseSensitive?: boolean;
};

export type ShortWritingContentGroup = {
  id: string;
  label: string;
  phrases: string[];
};

export type ShortWritingExercise = BaseExercise & {
  type: "short_writing";
  topic: string;
  minWords: number;
  maxWords: number;
  suggestedWords: string[];
  minimumSuggestedWordMatches: number;
  minimumSentences?: number;
  requiredPhraseOrder?: string[];
  requiredContentGroups?: ShortWritingContentGroup[];
  sampleAnswer: string;
};

export type CoreExercise =
  | MultipleChoiceExercise
  | ArrangeWordsExercise
  | FillBlankExercise
  | DialogueChoiceExercise
  | ListeningChoiceExercise;

export type ExtendedExercise =
  | MatchPairsExercise
  | ArrangeDialogueExercise
  | SentenceRewriteExercise
  | ShortWritingExercise;

export type Exercise = CoreExercise | ExtendedExercise;

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

export type MatchPairsExerciseAnswer = {
  type: "match_pairs";
  pairs: MatchPair[];
};

export type ArrangeDialogueExerciseAnswer = {
  type: "arrange_dialogue";
  lineIds: string[];
};

export type SentenceRewriteExerciseAnswer = {
  type: "sentence_rewrite";
  value: string;
};

export type ShortWritingExerciseAnswer = {
  type: "short_writing";
  value: string;
};

export type CoreExerciseAnswer =
  ChoiceExerciseAnswer | ArrangeWordsExerciseAnswer | FillBlankExerciseAnswer;

export type ExtendedExerciseAnswer =
  | MatchPairsExerciseAnswer
  | ArrangeDialogueExerciseAnswer
  | SentenceRewriteExerciseAnswer
  | ShortWritingExerciseAnswer;

export type ExerciseAnswer = CoreExerciseAnswer | ExtendedExerciseAnswer;

export type ExerciseFeedbackCriterion = {
  id: string;
  label: string;
  passed: boolean;
};

export type ExerciseCheckResult = {
  isCorrect: boolean;
  scoreRatio: number;
  correctAnswerText: string;
  normalizedUserAnswer: string;
  explanation?: string;
  feedbackMessage?: string;
  feedbackCriteria?: ExerciseFeedbackCriterion[];
};
