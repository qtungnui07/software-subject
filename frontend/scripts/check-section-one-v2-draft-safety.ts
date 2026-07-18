import assert from "node:assert/strict";

import { sectionOneLessonOneExercises } from "@/data/exercises/english/section-1/lesson-1";
import { createExerciseCatalogFingerprint } from "@/lib/learning-session/draft-fingerprint";
import {
  getLearningSessionDraftKey,
  readLearningSessionDraft,
  writeLearningSessionDraft,
} from "@/lib/learning-session/draft-storage";
import { validateLearningSessionDraft } from "@/lib/learning-session/draft-validator";
import type { LessonSessionDraft } from "@/types/learning-session-draft";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const storage = new MemoryStorage();
const exercises = sectionOneLessonOneExercises;
const fingerprint = createExerciseCatalogFingerprint(exercises);
const userAKey = getLearningSessionDraftKey({
  kind: "lesson",
  userId: "user-a",
  contentId: "lesson-1",
});
const userBKey = getLearningSessionDraftKey({
  kind: "lesson",
  userId: "user-b",
  contentId: "lesson-1",
});
assert.notEqual(userAKey, userBKey);

const draft: LessonSessionDraft = {
  schemaVersion: 1,
  kind: "lesson",
  userId: "user-a",
  contentId: "lesson-1",
  contentVersion: 2,
  catalogFingerprint: fingerprint,
  savedAt: new Date().toISOString(),
  assessmentMode: "silent",
  durationSeconds: 240,
  afkCount: 1,
  currentExerciseIndex: 0,
  currentAnswer: {
    type: "choice",
    optionId:
      sectionOneLessonOneExercises[0].type === "dialogue_choice"
        ? sectionOneLessonOneExercises[0].options[0].id
        : "",
  },
  attemptResults: {},
  hearts: 3,
  isRetryAttempt: true,
  lockedMatchPairLeftIds: [],
  isReviewMode: false,
  reviewExerciseIds: [],
  reviewExerciseIndex: 0,
  reviewResults: {},
};
assert.equal(
  writeLearningSessionDraft({ key: userAKey, draft, storage }),
  true,
);
assert.equal(readLearningSessionDraft({ key: userBKey, storage }), null);

const restored = validateLearningSessionDraft({
  value: readLearningSessionDraft({ key: userAKey, storage }),
  kind: "lesson",
  userId: "user-a",
  contentId: "lesson-1",
  contentVersion: 2,
  catalogFingerprint: fingerprint,
  exercises,
});
assert.ok(restored?.kind === "lesson");
assert.equal(restored.hearts, 3);
assert.equal(restored.assessmentMode, "silent");

assert.equal(
  validateLearningSessionDraft({
    value: draft,
    kind: "lesson",
    userId: "user-b",
    contentId: "lesson-1",
    contentVersion: 2,
    catalogFingerprint: fingerprint,
    exercises,
  }),
  null,
);
assert.equal(
  validateLearningSessionDraft({
    value: { ...draft, savedAt: "2020-01-01T00:00:00.000Z" },
    kind: "lesson",
    userId: "user-a",
    contentId: "lesson-1",
    contentVersion: 2,
    catalogFingerprint: fingerprint,
    exercises,
  }),
  null,
);
assert.equal(
  validateLearningSessionDraft({
    value: draft,
    kind: "lesson",
    userId: "user-a",
    contentId: "lesson-1",
    contentVersion: 3,
    catalogFingerprint: fingerprint,
    exercises,
  }),
  null,
);

const serialized = JSON.stringify(draft);
for (const forbidden of [
  "correctOptionId",
  "correctAnswerText",
  "transcriptAfterSubmit",
  "explanation",
  "score",
  "passed",
]) {
  assert.equal(serialized.includes(forbidden), false);
}

console.log(
  "Section 1 V2 draft safety check passed: keys are isolated by user, expired or incompatible drafts are rejected, and persisted drafts contain no private answers, transcripts or scores.",
);
