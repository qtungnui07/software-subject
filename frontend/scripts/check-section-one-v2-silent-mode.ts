import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";

const listeningContexts = Object.values(englishSectionOneExerciseCatalog)
  .flat()
  .map((exercise) => exercise.context)
  .filter((context) => context?.kind === "listening");

assert.ok(listeningContexts.length >= 8);
for (const context of listeningContexts) {
  assert.ok(context?.kind === "listening");
  assert.ok(context.silentAlternative?.trim());
  assert.notEqual(
    context.silentAlternative?.trim().toLowerCase(),
    context.spokenText?.trim().toLowerCase(),
  );
  assert.notEqual(
    context.silentAlternative?.trim().toLowerCase(),
    context.transcriptAfterSubmit?.trim().toLowerCase(),
  );
}

const contextCard = readFileSync(
  "components/lesson/exercise-context-card.tsx",
  "utf8",
);
assert.match(contextCard, /assessmentMode === "silent"/);
assert.match(contextCard, /silentAlternative/);
assert.doesNotMatch(contextCard, /autoPlay/);

const checkpointClient = readFileSync(
  "components/checkpoint/checkpoint-client.tsx",
  "utf8",
);
assert.match(checkpointClient, /CheckpointModeDialog/);
assert.match(checkpointClient, /assessmentMode/);
assert.match(checkpointClient, /mode được khóa|Không âm thanh|Tiêu chuẩn/);

console.log(
  "Section 1 V2 silent mode check passed: every listening context has a distinct text alternative, lesson audio remains non-autoplay, and checkpoint mode is selected per attempt.",
);
