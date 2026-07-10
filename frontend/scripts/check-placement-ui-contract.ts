import assert from "node:assert/strict";

import {
  countAnsweredPlacementQuestions,
  createPlacementDraft,
  getPlacementDraftStorageKey,
  parsePlacementDraft,
} from "@/lib/placement-test/placement-draft";
import { getPlacementSectionPresentation } from "@/lib/placement-test/placement-presentation";

const submissionId = "f32e507b-9d44-4079-b4aa-4b930417695a";
const draft = createPlacementDraft(
  submissionId,
  "2026-07-09T08:00:00.000Z"
);
draft.currentQuestionIndex = 99;
draft.answers = {
  q1: { type: "choice", optionId: "o1" },
  q2: { type: "fill_blank", value: "answer" },
  q3: { type: "fill_blank", value: "   " },
};

const parsed = parsePlacementDraft(JSON.stringify(draft), 12);
assert(parsed, "A valid draft must restore.");
assert.equal(parsed.currentQuestionIndex, 11, "Restored index must be clamped.");
assert.equal(parsed.submissionId, submissionId);
assert.equal(
  countAnsweredPlacementQuestions(parsed.answers, ["q1", "q2", "q3"]),
  2,
  "Blank fill answers must remain unanswered."
);
assert.equal(
  parsePlacementDraft(
    JSON.stringify({ ...draft, testVersion: "english-placement-v0" }),
    12
  ),
  null,
  "Drafts from an old test version must be rejected."
);
assert.equal(
  getPlacementDraftStorageKey("user-a").includes("user-a"),
  true,
  "Draft storage must be scoped to the signed-in user."
);
assert.equal(
  getPlacementSectionPresentation("english-section-3").level,
  "Nâng cao"
);

console.log(
  "Placement UI contract check passed: versioned user-scoped drafts restore safely, indices clamp, answered counts remain accurate, and all result presentations resolve."
);
