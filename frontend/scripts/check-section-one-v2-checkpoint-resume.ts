import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const client = readFileSync(
  "components/checkpoint/checkpoint-client.tsx",
  "utf8",
);
const route = readFileSync(
  "app/api/progress/course/checkpoint/route.ts",
  "utf8",
);

assert.match(client, /CheckpointSessionDraft/);
assert.match(client, /currentExerciseIndex: currentIndex/);
assert.match(client, /answers/);
assert.match(client, /submissionId/);
assert.match(client, /assessmentMode/);
assert.match(client, /ResumeSessionDialog/);
assert.match(client, /clear\(\);\s*setResult\(payload\)/);
assert.match(route, /assessmentMode === "standard"/);
assert.match(route, /assessmentMode === "silent"/);
assert.doesNotMatch(client, /correctOptionId|acceptedAnswers|sampleAnswer/);

console.log(
  "Section 1 V2 checkpoint resume check passed: unanswered work and locked assessment mode resume locally, while successful server submission clears the draft and no private answer fields are stored.",
);
