import type {
  Exercise,
  ExerciseContext,
  ExerciseSkill,
} from "@/types/exercise";

const VALID_SKILLS = new Set<ExerciseSkill>([
  "vocabulary",
  "grammar",
  "listening",
  "reading",
  "conversation",
]);

export type ExerciseValidationIssue = {
  exerciseId: string;
  message: string;
};

const normalizeComparableText = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");

const countWords = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const validateContext = (
  exerciseId: string,
  context: ExerciseContext
): ExerciseValidationIssue[] => {
  const issues: ExerciseValidationIssue[] = [];

  if (!context.id.trim()) {
    issues.push({ exerciseId, message: "Exercise context ID is required." });
  }

  if (!context.title.trim()) {
    issues.push({ exerciseId, message: "Exercise context title is required." });
  }

  switch (context.kind) {
    case "reading":
      if (!context.text.trim()) {
        issues.push({ exerciseId, message: "Reading context text is required." });
      }
      break;
    case "listening":
      if (!context.audioSrc?.trim() && !context.spokenText?.trim()) {
        issues.push({
          exerciseId,
          message: "Listening context needs audioSrc or spokenText.",
        });
      }
      if (
        context.silentAlternative !== undefined &&
        !context.silentAlternative.trim()
      ) {
        issues.push({
          exerciseId,
          message: "Listening silentAlternative cannot be empty.",
        });
      }
      if (
        context.transcriptAfterSubmit !== undefined &&
        !context.transcriptAfterSubmit.trim()
      ) {
        issues.push({
          exerciseId,
          message: "Listening transcriptAfterSubmit cannot be empty.",
        });
      }
      break;
    case "scenario":
      if (!context.description.trim()) {
        issues.push({
          exerciseId,
          message: "Scenario context description is required.",
        });
      }
      break;
  }

  return issues;
};

const validateChoiceExercise = (
  exercise: Extract<
    Exercise,
    { type: "multiple_choice" | "dialogue_choice" | "listening_choice" }
  >
) => {
  const issues: ExerciseValidationIssue[] = [];
  const optionIds = exercise.options.map((option) => option.id);
  const normalizedOptionTexts = exercise.options.map((option) =>
    normalizeComparableText(option.text)
  );

  if (exercise.options.length < 2) {
    issues.push({
      exerciseId: exercise.id,
      message: "Choice exercise needs at least two options.",
    });
  }

  if (new Set(optionIds).size !== optionIds.length) {
    issues.push({
      exerciseId: exercise.id,
      message: "Choice option IDs must be unique.",
    });
  }

  if (normalizedOptionTexts.some((text) => !text)) {
    issues.push({
      exerciseId: exercise.id,
      message: "Choice option text cannot be empty.",
    });
  }

  if (new Set(normalizedOptionTexts).size !== normalizedOptionTexts.length) {
    issues.push({
      exerciseId: exercise.id,
      message: "Choice option text must be unique.",
    });
  }

  if (!optionIds.includes(exercise.correctOptionId)) {
    issues.push({
      exerciseId: exercise.id,
      message: "correctOptionId does not exist in options.",
    });
  }

  if (
    exercise.type === "listening_choice" &&
    !exercise.audioSrc?.trim() &&
    !exercise.spokenText?.trim() &&
    exercise.context?.kind !== "listening"
  ) {
    issues.push({
      exerciseId: exercise.id,
      message:
        "Listening exercise needs audioSrc, spokenText or a listening context.",
    });
  }

  return issues;
};

export const validateExercise = (
  exercise: Exercise
): ExerciseValidationIssue[] => {
  const issues: ExerciseValidationIssue[] = [];

  if (!exercise.id.trim()) {
    issues.push({ exerciseId: exercise.id, message: "Exercise ID is required." });
  }

  if (!exercise.lessonId.trim()) {
    issues.push({ exerciseId: exercise.id, message: "lessonId is required." });
  }

  if (!exercise.instruction.trim() || !exercise.prompt.trim()) {
    issues.push({
      exerciseId: exercise.id,
      message: "Instruction and prompt are required.",
    });
  }

  if (exercise.hint !== undefined && !exercise.hint.trim()) {
    issues.push({
      exerciseId: exercise.id,
      message: "Exercise hint cannot be empty when provided.",
    });
  }

  if (!VALID_SKILLS.has(exercise.skill)) {
    issues.push({
      exerciseId: exercise.id,
      message: "Exercise skill is invalid.",
    });
  }

  if (![1, 2, 3].includes(exercise.difficulty)) {
    issues.push({
      exerciseId: exercise.id,
      message: "Exercise difficulty must be 1, 2 or 3.",
    });
  }

  if (
    exercise.contentVersion !== undefined &&
    (!Number.isInteger(exercise.contentVersion) || exercise.contentVersion < 1)
  ) {
    issues.push({
      exerciseId: exercise.id,
      message: "contentVersion must be a positive integer when provided.",
    });
  }

  if (exercise.context) {
    issues.push(...validateContext(exercise.id, exercise.context));
  }

  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return [...issues, ...validateChoiceExercise(exercise)];
    case "arrange_words": {
      const tokenIds = exercise.tokens.map((token) => token.id);
      const correctOrderIds = exercise.correctOrder;

      if (exercise.tokens.length < 2) {
        issues.push({
          exerciseId: exercise.id,
          message: "Arrange exercise needs at least two tokens.",
        });
      }

      if (new Set(tokenIds).size !== tokenIds.length) {
        issues.push({
          exerciseId: exercise.id,
          message: "Arrange token IDs must be unique.",
        });
      }

      if (exercise.tokens.some((token) => !token.text.trim())) {
        issues.push({
          exerciseId: exercise.id,
          message: "Arrange token text cannot be empty.",
        });
      }

      if (
        correctOrderIds.length !== tokenIds.length ||
        new Set(correctOrderIds).size !== correctOrderIds.length ||
        correctOrderIds.some((tokenId) => !tokenIds.includes(tokenId))
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "correctOrder must contain every token ID exactly once.",
        });
      }

      return issues;
    }
    case "fill_blank": {
      const normalizedAnswers = exercise.acceptedAnswers.map(
        normalizeComparableText
      );
      if (
        exercise.acceptedAnswers.length === 0 ||
        normalizedAnswers.some((answer) => !answer)
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Fill blank exercise needs non-empty accepted answers.",
        });
      }
      if (new Set(normalizedAnswers).size !== normalizedAnswers.length) {
        issues.push({
          exerciseId: exercise.id,
          message: "Fill blank accepted answers must be unique.",
        });
      }
      return issues;
    }
    case "match_pairs": {
      const leftIds = exercise.leftItems.map((item) => item.id);
      const rightIds = exercise.rightItems.map((item) => item.id);
      const pairLeftIds = exercise.correctPairs.map((pair) => pair.leftId);
      const pairRightIds = exercise.correctPairs.map((pair) => pair.rightId);

      if (exercise.leftItems.length < 2 || exercise.rightItems.length < 2) {
        issues.push({
          exerciseId: exercise.id,
          message: "Match pairs exercise needs at least two items on each side.",
        });
      }
      if (exercise.leftItems.length !== exercise.rightItems.length) {
        issues.push({
          exerciseId: exercise.id,
          message: "Match pairs exercise needs equally sized item sets.",
        });
      }
      if (
        new Set(leftIds).size !== leftIds.length ||
        new Set(rightIds).size !== rightIds.length
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Match pair item IDs must be unique within each side.",
        });
      }
      if (
        exercise.leftItems.some((item) => !item.text.trim()) ||
        exercise.rightItems.some((item) => !item.text.trim())
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Match pair item text cannot be empty.",
        });
      }
      if (
        exercise.correctPairs.length !== exercise.leftItems.length ||
        new Set(pairLeftIds).size !== pairLeftIds.length ||
        new Set(pairRightIds).size !== pairRightIds.length ||
        pairLeftIds.some((id) => !leftIds.includes(id)) ||
        pairRightIds.some((id) => !rightIds.includes(id))
      ) {
        issues.push({
          exerciseId: exercise.id,
          message:
            "correctPairs must connect every left and right item exactly once.",
        });
      }
      return issues;
    }
    case "arrange_dialogue": {
      const lineIds = exercise.lines.map((line) => line.id);
      const correctOrderIds = exercise.correctOrder;
      const distractorCount = lineIds.length - correctOrderIds.length;

      if (exercise.lines.length < 3 || correctOrderIds.length < 3) {
        issues.push({
          exerciseId: exercise.id,
          message: "Arrange dialogue needs at least three ordered lines.",
        });
      }
      if (new Set(lineIds).size !== lineIds.length) {
        issues.push({
          exerciseId: exercise.id,
          message: "Dialogue line IDs must be unique.",
        });
      }
      if (
        exercise.lines.some(
          (line) => !line.speaker.trim() || !line.text.trim()
        )
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Dialogue speaker and text cannot be empty.",
        });
      }
      if (
        new Set(correctOrderIds).size !== correctOrderIds.length ||
        correctOrderIds.some((lineId) => !lineIds.includes(lineId))
      ) {
        issues.push({
          exerciseId: exercise.id,
          message:
            "Dialogue correctOrder must contain unique existing line IDs.",
        });
      }
      if (distractorCount < 0 || distractorCount > 2) {
        issues.push({
          exerciseId: exercise.id,
          message: "Arrange dialogue supports at most two distractor lines.",
        });
      }
      return issues;
    }
    case "sentence_rewrite": {
      const normalizedAnswers = exercise.acceptedAnswers.map(
        normalizeComparableText
      );
      const normalizedRequiredWords = (exercise.requiredWords ?? []).map(
        normalizeComparableText
      );

      if (!exercise.sourceSentence.trim()) {
        issues.push({
          exerciseId: exercise.id,
          message: "Sentence rewrite sourceSentence is required.",
        });
      }
      if (
        normalizedAnswers.length === 0 ||
        normalizedAnswers.some((answer) => !answer)
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Sentence rewrite needs non-empty accepted answers.",
        });
      }
      if (new Set(normalizedAnswers).size !== normalizedAnswers.length) {
        issues.push({
          exerciseId: exercise.id,
          message: "Sentence rewrite accepted answers must be unique.",
        });
      }
      if (
        normalizedRequiredWords.some((word) => !word) ||
        new Set(normalizedRequiredWords).size !== normalizedRequiredWords.length
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Sentence rewrite requiredWords must be non-empty and unique.",
        });
      }
      for (const requiredWord of normalizedRequiredWords) {
        if (!normalizedAnswers.some((answer) => answer.includes(requiredWord))) {
          issues.push({
            exerciseId: exercise.id,
            message: `Required word "${requiredWord}" is missing from accepted answers.`,
          });
        }
      }
      return issues;
    }
    case "short_writing": {
      const normalizedSuggestedWords = exercise.suggestedWords.map(
        normalizeComparableText
      );
      const minimumSentences = exercise.minimumSentences ?? 1;
      const sampleWordCount = countWords(exercise.sampleAnswer);

      if (!exercise.topic.trim()) {
        issues.push({
          exerciseId: exercise.id,
          message: "Short writing topic is required.",
        });
      }
      if (
        !Number.isInteger(exercise.minWords) ||
        !Number.isInteger(exercise.maxWords) ||
        exercise.minWords < 5 ||
        exercise.maxWords <= exercise.minWords ||
        exercise.maxWords > 70
      ) {
        issues.push({
          exerciseId: exercise.id,
          message:
            "Short writing word limits must be integers with 5 <= minWords < maxWords <= 70.",
        });
      }
      if (
        normalizedSuggestedWords.some((word) => !word) ||
        new Set(normalizedSuggestedWords).size !==
          normalizedSuggestedWords.length
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Short writing suggestedWords must be non-empty and unique.",
        });
      }
      if (
        !Number.isInteger(exercise.minimumSuggestedWordMatches) ||
        exercise.minimumSuggestedWordMatches < 0 ||
        exercise.minimumSuggestedWordMatches > exercise.suggestedWords.length
      ) {
        issues.push({
          exerciseId: exercise.id,
          message:
            "minimumSuggestedWordMatches must fit the suggested word list.",
        });
      }
      if (!Number.isInteger(minimumSentences) || minimumSentences < 1) {
        issues.push({
          exerciseId: exercise.id,
          message: "minimumSentences must be a positive integer.",
        });
      }
      const normalizedRequiredPhraseOrder = (exercise.requiredPhraseOrder ?? []).map(
        normalizeComparableText,
      );
      if (
        normalizedRequiredPhraseOrder.some((phrase) => !phrase) ||
        new Set(normalizedRequiredPhraseOrder).size !==
          normalizedRequiredPhraseOrder.length
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Short writing requiredPhraseOrder must be non-empty and unique.",
        });
      }
      if (
        normalizedRequiredPhraseOrder.length > 0 &&
        normalizedRequiredPhraseOrder.some(
          (phrase) => !normalizeComparableText(exercise.sampleAnswer).includes(phrase),
        )
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Short writing sampleAnswer must include every required phrase.",
        });
      }
      for (let index = 1; index < normalizedRequiredPhraseOrder.length; index += 1) {
        const previousPhrase = normalizedRequiredPhraseOrder[index - 1];
        const currentPhrase = normalizedRequiredPhraseOrder[index];
        if (
          normalizeComparableText(exercise.sampleAnswer).indexOf(previousPhrase) >=
          normalizeComparableText(exercise.sampleAnswer).indexOf(currentPhrase)
        ) {
          issues.push({
            exerciseId: exercise.id,
            message: "Short writing sampleAnswer must follow requiredPhraseOrder.",
          });
          break;
        }
      }
      const requiredContentGroups = exercise.requiredContentGroups ?? [];
      const normalizedGroupIds = requiredContentGroups.map((group) =>
        normalizeComparableText(group.id),
      );
      if (
        normalizedGroupIds.some((groupId) => !groupId) ||
        new Set(normalizedGroupIds).size !== normalizedGroupIds.length
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Short writing content group IDs must be non-empty and unique.",
        });
      }
      for (const group of requiredContentGroups) {
        const normalizedPhrases = group.phrases.map(normalizeComparableText);
        if (!group.label.trim()) {
          issues.push({
            exerciseId: exercise.id,
            message: `Short writing content group "${group.id}" needs a label.`,
          });
        }
        if (
          normalizedPhrases.length === 0 ||
          normalizedPhrases.some((phrase) => !phrase) ||
          new Set(normalizedPhrases).size !== normalizedPhrases.length
        ) {
          issues.push({
            exerciseId: exercise.id,
            message: `Short writing content group "${group.id}" needs non-empty unique phrases.`,
          });
          continue;
        }
        const normalizedSampleAnswer = normalizeComparableText(
          exercise.sampleAnswer,
        );
        if (
          !normalizedPhrases.some((phrase) =>
            normalizedSampleAnswer.includes(phrase),
          )
        ) {
          issues.push({
            exerciseId: exercise.id,
            message: `Short writing sampleAnswer must satisfy content group "${group.id}".`,
          });
        }
      }
      if (
        !exercise.sampleAnswer.trim() ||
        sampleWordCount < exercise.minWords ||
        sampleWordCount > exercise.maxWords
      ) {
        issues.push({
          exerciseId: exercise.id,
          message: "Short writing sampleAnswer must satisfy its word limits.",
        });
      }
      return issues;
    }
  }
};

export const validateExerciseCatalog = (catalog: Record<string, Exercise[]>) => {
  const issues: ExerciseValidationIssue[] = [];
  const exerciseIds = new Set<string>();
  const contextsByLessonAndId = new Map<string, string>();

  for (const [lessonId, exercises] of Object.entries(catalog)) {
    if (exercises.length === 0) {
      issues.push({
        exerciseId: lessonId,
        message: "Lesson exercise set cannot be empty.",
      });
    }

    for (const exercise of exercises) {
      if (exercise.lessonId !== lessonId) {
        issues.push({
          exerciseId: exercise.id,
          message: `Exercise lessonId must match catalog key ${lessonId}.`,
        });
      }

      if (exerciseIds.has(exercise.id)) {
        issues.push({
          exerciseId: exercise.id,
          message: "Exercise IDs must be globally unique.",
        });
      }
      exerciseIds.add(exercise.id);

      if (exercise.context) {
        const key = `${lessonId}:${exercise.context.id}`;
        const serializedContext = JSON.stringify(exercise.context);
        const existingContext = contextsByLessonAndId.get(key);

        if (existingContext && existingContext !== serializedContext) {
          issues.push({
            exerciseId: exercise.id,
            message:
              "A context ID cannot refer to different content in the same lesson.",
          });
        } else {
          contextsByLessonAndId.set(key, serializedContext);
        }
      }

      issues.push(...validateExercise(exercise));
    }
  }

  return issues;
};
