import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import {
  applyPlacementUnlock,
  recordCheckpointScore,
} from "@/lib/courses/course-unlock-policy";

const unlocked = applyPlacementUnlock(
  createDefaultCourseProgress("english"),
  "english-section-2",
);
const first = recordCheckpointScore(unlocked, "chapter-1-test", 78.25);
const lower = recordCheckpointScore(first.progress, "chapter-1-test", 61.5);
const higher = recordCheckpointScore(lower.progress, "chapter-1-test", 84.75);

assert.equal(first.progress.checkpointScores["chapter-1-test"], 78.25);
assert.equal(lower.progress.checkpointScores["chapter-1-test"], 78.25);
assert.equal(higher.progress.checkpointScores["chapter-1-test"], 84.75);
assert.equal(
  higher.progress.unlockedSectionIds.includes("english-section-2"),
  true,
);

const routeSource = readFileSync(
  "app/api/progress/course/checkpoint/route.ts",
  "utf8",
);
const serviceSource = readFileSync(
  "services/checkpoint-submission-service.ts",
  "utf8",
);
assert.doesNotMatch(routeSource, /body\?\.score|Number\(body\?\.score\)/);
assert.match(
  routeSource,
  /Checkpoint chỉ chấp nhận đáp án; điểm và trạng thái đạt được tính ở server/,
);
assert.match(serviceSource, /scoreCheckpointSubmission/);
assert.match(serviceSource, /completeLearningNodeForUser/);
assert.match(serviceSource, /idempotencyKey: submission\.idempotencyKey/);
assert.match(serviceSource, /recordCheckpointScoreForUser/);

console.log(
  "Section 1 V2 retake check passed: decimal best scores only improve, lower attempts never relock, the API rejects client-computed score fields, and server grading reuses idempotent completion rewards.",
);
