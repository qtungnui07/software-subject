import { validateExercise } from "@/lib/exercises/exercise-validator";
import type {
  CoreExercise,
  CoreExerciseAnswer,
  CoreExerciseType,
  Exercise,
} from "@/types/exercise";
import {
  ENGLISH_PLACEMENT_TEST_VERSION,
  type PlacementBand,
  type PlacementQuestionDefinition,
  type PlacementTestSubmission,
} from "@/types/placement-test";

const EXPECTED_QUESTION_COUNT = 12;
const EXPECTED_PER_BAND = 4;
const EXPECTED_TYPES = new Set<CoreExerciseType>([
  "multiple_choice",
  "arrange_words",
  "fill_blank",
  "dialogue_choice",
  "listening_choice",
]);

export type PlacementValidationIssue = {
  field: string;
  message: string;
};

const normalizeComparableText = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");

export const validatePlacementQuestions = (
  questions: PlacementQuestionDefinition[],
  existingCourseExercises: Exercise[] = []
): PlacementValidationIssue[] => {
  const issues: PlacementValidationIssue[] = [];
  const questionIds = new Set<string>();
  const orders = new Set<number>();
  const prompts = new Set<string>();
  const types = new Set<CoreExerciseType>();
  const skills = new Set<string>();
  const bandCounts = new Map<PlacementBand, number>([
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
  const coursePrompts = new Set(
    existingCourseExercises.map((exercise) =>
      normalizeComparableText(exercise.prompt)
    )
  );

  if (questions.length !== EXPECTED_QUESTION_COUNT) {
    issues.push({
      field: "questions",
      message: `Placement Test must contain exactly ${EXPECTED_QUESTION_COUNT} questions.`,
    });
  }

  for (const question of questions) {
    const { exercise, band, order } = question;
    const field = exercise.id || `order-${order}`;

    if (questionIds.has(exercise.id)) {
      issues.push({ field, message: "Question IDs must be globally unique." });
    }
    questionIds.add(exercise.id);

    if (orders.has(order)) {
      issues.push({ field, message: "Question order values must be unique." });
    }
    orders.add(order);

    if (![1, 2, 3].includes(band)) {
      issues.push({ field, message: "Question band must be 1, 2 or 3." });
    } else {
      bandCounts.set(band, (bandCounts.get(band) ?? 0) + 1);
    }

    if (exercise.difficulty !== band) {
      issues.push({
        field,
        message: "Exercise difficulty must match its placement band.",
      });
    }

    if (exercise.lessonId !== ENGLISH_PLACEMENT_TEST_VERSION) {
      issues.push({
        field,
        message: `Placement exercise lessonId must be ${ENGLISH_PLACEMENT_TEST_VERSION}.`,
      });
    }

    const normalizedPrompt = normalizeComparableText(exercise.prompt);
    if (prompts.has(normalizedPrompt)) {
      issues.push({ field, message: "Placement prompts must be unique." });
    }
    prompts.add(normalizedPrompt);

    if (coursePrompts.has(normalizedPrompt)) {
      issues.push({
        field,
        message: "Placement prompt duplicates an existing course exercise.",
      });
    }

    types.add(exercise.type);
    skills.add(exercise.skill);

    for (const exerciseIssue of validateExercise(exercise)) {
      issues.push({ field, message: exerciseIssue.message });
    }
  }

  for (const band of [1, 2, 3] as const) {
    if (bandCounts.get(band) !== EXPECTED_PER_BAND) {
      issues.push({
        field: `band-${band}`,
        message: `Placement band ${band} must contain exactly ${EXPECTED_PER_BAND} questions.`,
      });
    }
  }

  for (let order = 1; order <= EXPECTED_QUESTION_COUNT; order += 1) {
    if (!orders.has(order)) {
      issues.push({
        field: "order",
        message: `Placement question order is missing ${order}.`,
      });
    }
  }

  for (const type of EXPECTED_TYPES) {
    if (!types.has(type)) {
      issues.push({
        field: "exercise-types",
        message: `Placement Test must include ${type}.`,
      });
    }
  }

  if (skills.size < 5) {
    issues.push({
      field: "skills",
      message: "Placement Test must cover all five learning skills.",
    });
  }

  return issues;
};

const isAnswerShapeValid = (
  exercise: CoreExercise,
  answer: CoreExerciseAnswer
) => {
  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return (
        answer.type === "choice" &&
        typeof answer.optionId === "string" &&
        exercise.options.some((option) => option.id === answer.optionId)
      );
    case "arrange_words": {
      if (
        answer.type !== "arrange_words" ||
        !Array.isArray(answer.tokenIds) ||
        answer.tokenIds.some((tokenId) => typeof tokenId !== "string")
      ) {
        return false;
      }

      const availableIds = new Set(exercise.tokens.map((token) => token.id));
      return (
        new Set(answer.tokenIds).size === answer.tokenIds.length &&
        answer.tokenIds.every((tokenId) => availableIds.has(tokenId))
      );
    }
    case "fill_blank":
      return answer.type === "fill_blank" && typeof answer.value === "string";
  }
};

export const validatePlacementSubmission = (
  submission: PlacementTestSubmission,
  questions: PlacementQuestionDefinition[]
): PlacementValidationIssue[] => {
  const issues: PlacementValidationIssue[] = [];
  const questionsById = new Map(
    questions.map((question) => [question.exercise.id, question])
  );
  const submittedQuestionIds = new Set<string>();

  if (submission.testVersion !== ENGLISH_PLACEMENT_TEST_VERSION) {
    issues.push({
      field: "testVersion",
      message: "Unsupported Placement Test version.",
    });
  }

  if (
    submission.submissionId &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      submission.submissionId
    )
  ) {
    issues.push({
      field: "submissionId",
      message: "submissionId must be a valid UUID when provided.",
    });
  }

  if (!Array.isArray(submission.answers)) {
    return [
      ...issues,
      { field: "answers", message: "Placement answers must be an array." },
    ];
  }

  for (const entry of submission.answers) {
    if (submittedQuestionIds.has(entry.questionId)) {
      issues.push({
        field: entry.questionId,
        message: "A placement question cannot be submitted more than once.",
      });
      continue;
    }
    submittedQuestionIds.add(entry.questionId);

    const question = questionsById.get(entry.questionId);
    if (!question) {
      issues.push({
        field: entry.questionId,
        message: "Unknown placement question ID.",
      });
      continue;
    }

    if (!isAnswerShapeValid(question.exercise, entry.answer)) {
      issues.push({
        field: entry.questionId,
        message: "Placement answer does not match the question contract.",
      });
    }
  }

  if (submission.startedAt && Number.isNaN(Date.parse(submission.startedAt))) {
    issues.push({
      field: "startedAt",
      message: "startedAt must be a valid ISO date when provided.",
    });
  }

  return issues;
};
