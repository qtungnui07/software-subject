import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { englishPlacementQuestions } from "@/data/placement-tests/english-placement-test";
import { createAdaptiveErrorBody } from "@/lib/errors/api-response";
import { findPrivilegedTopLevelFields } from "@/lib/hardening/adaptive-api-security";
import { sanitizeInternalRedirect } from "@/lib/onboarding/onboarding-redirect";
import { toPublicPlacementQuestions } from "@/lib/placement-test/placement-public-question";

for (const safe of [
  "/learn",
  "/learn?section=english-section-2",
  "/placement-test#start",
]) {
  assert.equal(sanitizeInternalRedirect(safe), safe);
}

for (const unsafe of [
  "https://evil.example",
  "//evil.example",
  "javascript:alert(1)",
  "/\\evil.example",
  "/%2F%2Fevil.example",
  "/%5C%5Cevil.example",
  "/learn%00",
  "not-a-path",
]) {
  assert.equal(
    sanitizeInternalRedirect(unsafe),
    null,
    `${unsafe} must not be accepted as an internal redirect.`,
  );
}

assert.deepEqual(
  findPrivilegedTopLevelFields({
    userId: "forged-user",
    xp: 99999,
    unlockedSectionIds: ["english-section-3"],
    nodeId: "lesson-1",
  }).sort(),
  ["unlockedSectionIds", "userId", "xp"],
);
assert.deepEqual(
  findPrivilegedTopLevelFields({
    answers: [{ answer: { type: "fill_blank", value: "xp" } }],
  }),
  [],
  "Nested learner answer values must not be mistaken for privileged fields.",
);

const publicQuestions = JSON.stringify(
  toPublicPlacementQuestions(englishPlacementQuestions),
);
for (const secret of [
  "correctOptionId",
  "correctOrder",
  "acceptedAnswers",
  "explanation",
]) {
  assert.equal(publicQuestions.includes(secret), false);
}

const errorBody = createAdaptiveErrorBody(
  "NODE_LOCKED",
  "Bài học này chưa được mở.",
);
assert.equal(errorBody.ok, false);
assert.equal(errorBody.error, "Bài học này chưa được mở.");
assert.equal(errorBody.code, "NODE_LOCKED");
assert.equal(JSON.stringify(errorBody).includes("stack"), false);

const adaptiveRoutes = [
  "app/api/learning/complete/route.ts",
  "app/api/onboarding/route.ts",
  "app/api/placement-test/route.ts",
  "app/api/placement-test/result/route.ts",
  "app/api/progress/course/route.ts",
  "app/api/progress/course/select-section/route.ts",
  "app/api/progress/course/complete-node/route.ts",
  "app/api/progress/course/checkpoint/route.ts",
];
for (const relativePath of adaptiveRoutes) {
  const source = readFileSync(resolve(process.cwd(), relativePath), "utf8");
  assert.equal(
    source.includes("adaptiveErrorResponse") ||
      source.includes("adaptiveUnauthorizedResponse"),
    true,
    `${relativePath} must use the hardened adaptive error contract.`,
  );
  assert.equal(
    source.includes("error.stack"),
    false,
    `${relativePath} must not return stack traces.`,
  );
}

console.log(
  "API security contract check passed: redirects are internal-only, privileged client fields are rejected, Placement answers stay private, and adaptive errors never expose stack traces.",
);
