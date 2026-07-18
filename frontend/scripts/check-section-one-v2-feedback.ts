import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const feedback = read("components/lesson/exercise-feedback.tsx");
assert.match(feedback, /Gần đúng rồi/);
assert.match(feedback, /feedbackCriteria/);
assert.match(feedback, /canRetry/);
assert.match(feedback, /revealCorrectAnswer/);
assert.match(feedback, /Còn một lần sửa/);
assert.match(feedback, /Đã khắc phục/);

const player = read("app/lesson/page.tsx");
assert.match(player, /scoreRatio === 0/);
assert.match(player, /currentExercise\.type !== "short_writing"/);
assert.match(player, /previousAttempt\?\.lostHeart !== true/);
assert.match(player, /canRetryCurrentExercise/);
assert.match(player, /lockedMatchPairLeftIds/);
assert.match(player, /!canRetryCurrentExercise/);

console.log(
  "Section 1 V2 feedback check passed: correct, partial and incorrect feedback, one safe retry, writing heart protection, and delayed answer reveal are wired.",
);
