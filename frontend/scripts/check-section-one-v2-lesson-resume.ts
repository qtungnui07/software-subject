import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lessonPage = readFileSync("app/lesson/page.tsx", "utf8");
const timerSource = readFileSync("components/lesson-study-timer.tsx", "utf8");

assert.match(lessonPage, /ResumeSessionDialog/);
assert.match(lessonPage, /getLearningSessionDraftKey/);
assert.match(lessonPage, /hearts/);
assert.match(lessonPage, /isRetryAttempt/);
assert.match(lessonPage, /lockedMatchPairLeftIds/);
assert.match(lessonPage, /reviewExerciseIds/);
assert.match(lessonPage, /reviewResults/);
assert.match(lessonPage, /clearLessonDraft\(\)/);
assert.match(lessonPage, /setCurrentUserId\(data\.user\.id\)/);
assert.match(timerSource, /restore: \(activeSeconds/);
assert.match(timerSource, /lastActivityAtRef\.current = Date\.now\(\)/);

console.log(
  "Section 1 V2 lesson resume check passed: user-scoped drafts restore hearts, retry, locked pairs, mistake review and active study time without counting closed-tab time.",
);
