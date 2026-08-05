import { normalizeTextAnswer } from "@/lib/exercises/answer-normalizer";
import type {
  Exercise,
  ExerciseAnswer,
  ExerciseCheckResult,
} from "@/types/exercise";

const normalizeRewriteAnswer = (value: string, caseSensitive = false) => {
  const normalized = normalizeTextAnswer(value, {
    caseSensitive,
    ignoreTerminalPunctuation: true,
  });

  if (caseSensitive) return normalized;

  return normalized
    .replace(/\bi'm\b/g, "i am")
    .replace(/\byou're\b/g, "you are")
    .replace(/\bhe's\b/g, "he is")
    .replace(/\bshe's\b/g, "she is")
    .replace(/\bit's\b/g, "it is")
    .replace(/\bwe're\b/g, "we are")
    .replace(/\bthey're\b/g, "they are")
    .replace(/\bcan't\b/g, "cannot")
    .replace(/\bdon't\b/g, "do not")
    .replace(/\bdoesn't\b/g, "does not")
    .replace(/\bdidn't\b/g, "did not");
};

const getChoiceAnswerText = (
  exercise: Extract<
    Exercise,
    { type: "multiple_choice" | "dialogue_choice" | "listening_choice" }
  >,
  optionId: string,
) => exercise.options.find((option) => option.id === optionId)?.text ?? "";

const toBinaryResult = (
  isCorrect: boolean,
  correctAnswerText: string,
  normalizedUserAnswer: string,
  explanation?: string,
): ExerciseCheckResult => ({
  isCorrect,
  scoreRatio: isCorrect ? 1 : 0,
  correctAnswerText,
  normalizedUserAnswer,
  explanation,
});

const checkChoiceExercise = (
  exercise: Extract<
    Exercise,
    { type: "multiple_choice" | "dialogue_choice" | "listening_choice" }
  >,
  answer: ExerciseAnswer,
): ExerciseCheckResult => {
  const optionId = answer.type === "choice" ? answer.optionId : "";
  const correctAnswerText = getChoiceAnswerText(
    exercise,
    exercise.correctOptionId,
  );

  return toBinaryResult(
    optionId === exercise.correctOptionId,
    correctAnswerText,
    getChoiceAnswerText(exercise, optionId),
    exercise.explanation,
  );
};

const checkArrangeWordsExercise = (
  exercise: Extract<Exercise, { type: "arrange_words" }>,
  answer: ExerciseAnswer,
): ExerciseCheckResult => {
  const tokenIds = answer.type === "arrange_words" ? answer.tokenIds : [];
  const tokenTextById = new Map(
    exercise.tokens.map((token) => [token.id, token.text]),
  );
  const correctAnswerText = exercise.correctOrder
    .map((tokenId) => tokenTextById.get(tokenId) ?? "")
    .join(" ")
    .trim();
  const normalizedUserAnswer = tokenIds
    .map((tokenId) => tokenTextById.get(tokenId) ?? "")
    .join(" ")
    .trim();
  const isCorrect =
    tokenIds.length === exercise.correctOrder.length &&
    tokenIds.every(
      (tokenId, index) => tokenId === exercise.correctOrder[index],
    );

  return toBinaryResult(
    isCorrect,
    correctAnswerText,
    normalizedUserAnswer,
    exercise.explanation,
  );
};

const checkFillBlankExercise = (
  exercise: Extract<Exercise, { type: "fill_blank" }>,
  answer: ExerciseAnswer,
): ExerciseCheckResult => {
  const rawAnswer = answer.type === "fill_blank" ? answer.value : "";
  const normalizeOptions = {
    caseSensitive: exercise.caseSensitive ?? false,
    ignoreTerminalPunctuation: true,
  };
  const normalizedUserAnswer = normalizeTextAnswer(rawAnswer, normalizeOptions);
  const normalizedAcceptedAnswers = exercise.acceptedAnswers.map(
    (acceptedAnswer) => normalizeTextAnswer(acceptedAnswer, normalizeOptions),
  );

  return toBinaryResult(
    normalizedAcceptedAnswers.includes(normalizedUserAnswer),
    exercise.acceptedAnswers[0] ?? "",
    normalizedUserAnswer,
    exercise.explanation,
  );
};

const checkMatchPairsExercise = (
  exercise: Extract<Exercise, { type: "match_pairs" }>,
  answer: ExerciseAnswer,
): ExerciseCheckResult => {
  const submittedPairs = answer.type === "match_pairs" ? answer.pairs : [];
  const submittedByLeftId = new Map(
    submittedPairs.map((pair) => [pair.leftId, pair.rightId]),
  );
  const leftTextById = new Map(
    exercise.leftItems.map((item) => [item.id, item.text]),
  );
  const rightTextById = new Map(
    exercise.rightItems.map((item) => [item.id, item.text]),
  );
  const correctLeftIds = exercise.correctPairs
    .filter((pair) => submittedByLeftId.get(pair.leftId) === pair.rightId)
    .map((pair) => pair.leftId);
  const correctCount = correctLeftIds.length;
  const scoreRatio =
    exercise.correctPairs.length === 0
      ? 0
      : correctCount / exercise.correctPairs.length;
  const formatPairs = (pairs: typeof exercise.correctPairs) =>
    pairs
      .map(
        (pair) =>
          `${leftTextById.get(pair.leftId) ?? pair.leftId} → ${
            rightTextById.get(pair.rightId) ?? pair.rightId
          }`,
      )
      .join("; ");

  return {
    isCorrect: scoreRatio === 1,
    scoreRatio,
    correctAnswerText: formatPairs(exercise.correctPairs),
    normalizedUserAnswer: formatPairs(submittedPairs),
    explanation: exercise.explanation,
    feedbackMessage: `Bạn đã nối đúng ${correctCount}/${exercise.correctPairs.length} cặp.`,
    feedbackCriteria: exercise.correctPairs.map((pair) => ({
      id: pair.leftId,
      label: leftTextById.get(pair.leftId) ?? pair.leftId,
      passed: correctLeftIds.includes(pair.leftId),
    })),
  };
};

const checkArrangeDialogueExercise = (
  exercise: Extract<Exercise, { type: "arrange_dialogue" }>,
  answer: ExerciseAnswer,
): ExerciseCheckResult => {
  const lineIds = answer.type === "arrange_dialogue" ? answer.lineIds : [];
  const lineTextById = new Map(
    exercise.lines.map((line) => [line.id, `${line.speaker}: ${line.text}`]),
  );
  const correctPositions = exercise.correctOrder.filter(
    (lineId, index) => lineIds[index] === lineId,
  ).length;
  const hasOnlyExpectedLines =
    lineIds.length === exercise.correctOrder.length &&
    lineIds.every((lineId) => exercise.correctOrder.includes(lineId));
  const scoreRatio =
    exercise.correctOrder.length === 0
      ? 0
      : correctPositions / exercise.correctOrder.length;
  const toText = (ids: string[]) =>
    ids.map((lineId) => lineTextById.get(lineId) ?? lineId).join(" | ");

  return {
    isCorrect: hasOnlyExpectedLines && scoreRatio === 1,
    scoreRatio: hasOnlyExpectedLines ? scoreRatio : 0,
    correctAnswerText: toText(exercise.correctOrder),
    normalizedUserAnswer: toText(lineIds),
    explanation: exercise.explanation,
    feedbackMessage: hasOnlyExpectedLines
      ? `${correctPositions}/${exercise.correctOrder.length} câu đang ở đúng vị trí.`
      : "Một câu không thuộc cuộc hội thoại vẫn đang được sử dụng.",
    feedbackCriteria: [
      {
        id: "expected-lines",
        label: "Chỉ sử dụng các câu thuộc hội thoại",
        passed: hasOnlyExpectedLines,
      },
      {
        id: "correct-order",
        label: `${correctPositions}/${exercise.correctOrder.length} vị trí chính xác`,
        passed: correctPositions === exercise.correctOrder.length,
      },
    ],
  };
};

const checkSentenceRewriteExercise = (
  exercise: Extract<Exercise, { type: "sentence_rewrite" }>,
  answer: ExerciseAnswer,
): ExerciseCheckResult => {
  const rawAnswer = answer.type === "sentence_rewrite" ? answer.value : "";
  const normalizedUserAnswer = normalizeRewriteAnswer(
    rawAnswer,
    exercise.caseSensitive ?? false,
  );
  const normalizedAcceptedAnswers = exercise.acceptedAnswers.map(
    (acceptedAnswer) =>
      normalizeRewriteAnswer(acceptedAnswer, exercise.caseSensitive ?? false),
  );
  const requiredWordResults = (exercise.requiredWords ?? []).map(
    (requiredWord) => ({
      id: `required-${requiredWord}`,
      label: `Sử dụng từ “${requiredWord}”`,
      passed: normalizedUserAnswer.includes(
        normalizeRewriteAnswer(requiredWord, exercise.caseSensitive ?? false),
      ),
    }),
  );
  const requiredWordsPresent = requiredWordResults.every(
    (criterion) => criterion.passed,
  );
  const acceptedAnswerMatch =
    normalizedAcceptedAnswers.includes(normalizedUserAnswer);
  const requiredWordRatio =
    requiredWordResults.length === 0
      ? 1
      : requiredWordResults.filter((criterion) => criterion.passed).length /
        requiredWordResults.length;
  const isCorrect = acceptedAnswerMatch && requiredWordsPresent;
  const scoreRatio = isCorrect
    ? 1
    : requiredWordRatio > 0
      ? Number((requiredWordRatio * 0.5).toFixed(4))
      : 0;

  return {
    isCorrect,
    scoreRatio,
    correctAnswerText: exercise.acceptedAnswers[0] ?? "",
    normalizedUserAnswer,
    explanation: exercise.explanation,
    feedbackMessage: acceptedAnswerMatch
      ? normalizedUserAnswer === normalizedAcceptedAnswers[0]
        ? "Cấu trúc và ý nghĩa của câu đã chính xác."
        : "Câu trả lời khác đáp án mẫu nhưng vẫn hợp lệ."
      : requiredWordsPresent
        ? "Bạn đã dùng đúng từ bắt buộc, nhưng cấu trúc câu chưa khớp đáp án hợp lệ."
        : `Câu trả lời cần sử dụng ${(exercise.requiredWords ?? [])
            .map((word) => `“${word}”`)
            .join(", ")}.`,
    feedbackCriteria: [
      ...requiredWordResults,
      {
        id: "accepted-structure",
        label: "Cấu trúc câu hợp lệ",
        passed: acceptedAnswerMatch,
      },
    ],
  };
};

const countWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const countSentences = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const terminalMarks = trimmed.match(/[.!?]+(?=\s|$)/g)?.length ?? 0;
  return Math.max(1, terminalMarks);
};

const normalizeWritingComparable = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en-US")
    .replace(/[’]/g, "'");

const checkShortWritingExercise = (
  exercise: Extract<Exercise, { type: "short_writing" }>,
  answer: ExerciseAnswer,
): ExerciseCheckResult => {
  const rawAnswer = answer.type === "short_writing" ? answer.value : "";
  const normalizedUserAnswer = rawAnswer.trim().replace(/\s+/g, " ");
  const comparableAnswer = normalizeWritingComparable(normalizedUserAnswer);
  const wordCount = countWords(normalizedUserAnswer);
  const sentenceCount = countSentences(normalizedUserAnswer);
  const minimumSentences = exercise.minimumSentences ?? 1;
  const matchedSuggestedWords = exercise.suggestedWords.filter((word) =>
    comparableAnswer.includes(normalizeWritingComparable(word)),
  ).length;

  const toleratedMaxWords =
    exercise.maxWords + Math.max(1, Math.floor(exercise.maxWords * 0.2));
  const exceedsRecommendedMaximum = wordCount > exercise.maxWords;
  const lengthPassed =
    wordCount >= exercise.minWords && wordCount <= toleratedMaxWords;
  const keywordsPassed =
    matchedSuggestedWords >= exercise.minimumSuggestedWordMatches;
  const sentencesPassed = sentenceCount >= minimumSentences;
  const contentPassed = normalizedUserAnswer.length > 0;
  const keywordScore =
    exercise.minimumSuggestedWordMatches === 0
      ? 1
      : Math.min(
          1,
          matchedSuggestedWords / exercise.minimumSuggestedWordMatches,
        );
  const requiredPhraseOrder = exercise.requiredPhraseOrder ?? [];
  const requiredPhraseIndexes = requiredPhraseOrder.map((phrase) =>
    comparableAnswer.indexOf(normalizeWritingComparable(phrase)),
  );
  const phraseOrderPassed =
    requiredPhraseOrder.length === 0 ||
    requiredPhraseIndexes.every(
      (phraseIndex, index) =>
        phraseIndex >= 0 &&
        (index === 0 || phraseIndex > requiredPhraseIndexes[index - 1]),
    );
  const requiredContentGroups = exercise.requiredContentGroups ?? [];
  const contentGroupResults = requiredContentGroups.map((group) => ({
    ...group,
    passed: group.phrases.some((phrase) =>
      comparableAnswer.includes(normalizeWritingComparable(phrase)),
    ),
  }));
  const matchedContentGroupCount = contentGroupResults.filter(
    (group) => group.passed,
  ).length;
  const contentGroupScore =
    requiredContentGroups.length === 0
      ? 1
      : matchedContentGroupCount / requiredContentGroups.length;
  const hasPhraseOrder = requiredPhraseOrder.length > 0;
  const hasContentGroups = requiredContentGroups.length > 0;
  const scoreRatio = Number(
    (
      hasContentGroups && hasPhraseOrder
        ? (lengthPassed ? 0.15 : 0) +
          keywordScore * 0.15 +
          (sentencesPassed ? 0.1 : 0) +
          (contentPassed ? 0.1 : 0) +
          (phraseOrderPassed ? 0.2 : 0) +
          contentGroupScore * 0.3
        : hasContentGroups
          ? (lengthPassed ? 0.2 : 0) +
            keywordScore * 0.2 +
            (sentencesPassed ? 0.15 : 0) +
            (contentPassed ? 0.1 : 0) +
            contentGroupScore * 0.35
          : hasPhraseOrder
            ? (lengthPassed ? 0.25 : 0) +
              keywordScore * 0.25 +
              (sentencesPassed ? 0.15 : 0) +
              (contentPassed ? 0.1 : 0) +
              (phraseOrderPassed ? 0.25 : 0)
            : (lengthPassed ? 0.3 : 0) +
              keywordScore * 0.4 +
              (sentencesPassed ? 0.2 : 0) +
              (contentPassed ? 0.1 : 0)
    ).toFixed(4),
  );

  return {
    isCorrect: scoreRatio === 1,
    scoreRatio,
    correctAnswerText: exercise.sampleAnswer,
    normalizedUserAnswer,
    explanation: exercise.explanation,
    feedbackMessage: exceedsRecommendedMaximum && lengthPassed
      ? `Bài viết có ${wordCount} từ, hơi dài hơn mức khuyến nghị ${exercise.maxWords} từ nhưng vẫn được chấp nhận. Bạn đã dùng ${matchedSuggestedWords}/${exercise.minimumSuggestedWordMatches} từ gợi ý cần thiết${hasContentGroups ? ` và hoàn thành ${matchedContentGroupCount}/${requiredContentGroups.length} nội dung bắt buộc` : ""}.`
      : `Bài viết có ${wordCount} từ, dùng ${matchedSuggestedWords}/${exercise.minimumSuggestedWordMatches} từ gợi ý cần thiết${hasContentGroups ? ` và hoàn thành ${matchedContentGroupCount}/${requiredContentGroups.length} nội dung bắt buộc` : ""}.`,
    feedbackCriteria: [
      {
        id: "word-count",
        label: `Ít nhất ${exercise.minWords} từ; khuyến nghị không quá ${exercise.maxWords} từ`,
        passed: lengthPassed,
      },
      {
        id: "suggested-words",
        label: `Dùng ít nhất ${exercise.minimumSuggestedWordMatches} từ gợi ý`,
        passed: keywordsPassed,
      },
      {
        id: "sentence-count",
        label: `Có ít nhất ${minimumSentences} câu`,
        passed: sentencesPassed,
      },
      {
        id: "non-empty",
        label: "Nội dung không để trống",
        passed: contentPassed,
      },
      ...(requiredPhraseOrder.length > 0
        ? [
            {
              id: "phrase-order",
              label: `Dùng đúng thứ tự: ${requiredPhraseOrder.join(" → ")}`,
              passed: phraseOrderPassed,
            },
          ]
        : []),
      ...contentGroupResults.map((group) => ({
        id: `content-${group.id}`,
        label: group.label,
        passed: group.passed,
      })),
    ],
  };
};

export const checkExerciseAnswer = (
  exercise: Exercise,
  answer: ExerciseAnswer,
): ExerciseCheckResult => {
  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return checkChoiceExercise(exercise, answer);
    case "arrange_words":
      return checkArrangeWordsExercise(exercise, answer);
    case "fill_blank":
      return checkFillBlankExercise(exercise, answer);
    case "match_pairs":
      return checkMatchPairsExercise(exercise, answer);
    case "arrange_dialogue":
      return checkArrangeDialogueExercise(exercise, answer);
    case "sentence_rewrite":
      return checkSentenceRewriteExercise(exercise, answer);
    case "short_writing":
      return checkShortWritingExercise(exercise, answer);
  }
};

export const isExerciseAnswerComplete = (
  exercise: Exercise,
  answer: ExerciseAnswer | null,
) => {
  if (!answer) return false;

  switch (exercise.type) {
    case "multiple_choice":
    case "dialogue_choice":
    case "listening_choice":
      return answer.type === "choice" && answer.optionId.length > 0;
    case "arrange_words":
      return (
        answer.type === "arrange_words" &&
        answer.tokenIds.length === exercise.tokens.length
      );
    case "fill_blank":
      return answer.type === "fill_blank" && answer.value.trim().length > 0;
    case "match_pairs":
      return (
        answer.type === "match_pairs" &&
        answer.pairs.length === exercise.leftItems.length &&
        new Set(answer.pairs.map((pair) => pair.leftId)).size ===
          exercise.leftItems.length &&
        new Set(answer.pairs.map((pair) => pair.rightId)).size ===
          exercise.rightItems.length
      );
    case "arrange_dialogue":
      return (
        answer.type === "arrange_dialogue" &&
        answer.lineIds.length === exercise.correctOrder.length &&
        new Set(answer.lineIds).size === exercise.correctOrder.length
      );
    case "sentence_rewrite":
      return (
        answer.type === "sentence_rewrite" && answer.value.trim().length > 0
      );
    case "short_writing":
      return answer.type === "short_writing" && answer.value.trim().length > 0;
  }
};
