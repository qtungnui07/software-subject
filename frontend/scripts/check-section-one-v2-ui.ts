import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { sectionOneV2PreviewExercises } from "@/data/exercises/english/section-1/section-one-v2-preview";
import { validateExerciseCatalog } from "@/lib/exercises/exercise-validator";
import type { ExtendedExerciseType } from "@/types/exercise";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const expectedTypes = [
  "match_pairs",
  "arrange_dialogue",
  "sentence_rewrite",
  "short_writing",
] as const satisfies readonly ExtendedExerciseType[];

assert.deepEqual(
  sectionOneV2PreviewExercises.map((exercise) => exercise.type),
  expectedTypes,
  "The preview catalog must contain one exercise for every extended type.",
);
assert.deepEqual(
  validateExerciseCatalog({
    "section-one-v2-preview": sectionOneV2PreviewExercises,
  }),
  [],
  "The Phase 2 preview catalog must pass the shared validator.",
);

const rendererSource = read("components/lesson/exercise-renderer.tsx");
const requiredRendererImports = [
  "MatchPairsExerciseView",
  "ArrangeDialogueExerciseView",
  "SentenceRewriteExerciseView",
  "ShortWritingExerciseView",
  "ExerciseContextCard",
];

for (const symbol of requiredRendererImports) {
  assert.match(
    rendererSource,
    new RegExp(symbol),
    `ExerciseRenderer must use ${symbol}.`,
  );
}

for (const type of expectedTypes) {
  assert.match(
    rendererSource,
    new RegExp(`case [\"']${type}[\"']`),
    `ExerciseRenderer must handle ${type}.`,
  );
}

const contextSource = read("components/lesson/exercise-context-card.tsx");
for (const contextKind of ["reading", "listening", "scenario"]) {
  assert.match(
    contextSource,
    new RegExp(`context\\.kind === [\"']${contextKind}[\"']`),
    `ExerciseContextCard must render ${contextKind} contexts.`,
  );
}
assert.doesNotMatch(
  contextSource,
  /autoPlay\s*=/,
  "Listening context must never autoplay.",
);

const previewPageSource = read("app/dev/section-one-v2/page.tsx");
assert.match(previewPageSource, /process\.env\.NODE_ENV === "production"/);
assert.match(previewPageSource, /notFound\(\)/);

const previewClientSource = read(
  "app/dev/section-one-v2/section-one-v2-preview-client.tsx",
);
assert.match(previewClientSource, /checkExerciseAnswer/);
assert.match(previewClientSource, /isExerciseAnswerComplete/);
assert.doesNotMatch(
  previewClientSource,
  /\/api\/learning\/complete|saveChapterOneProgress|STREAK_UPDATED_EVENT/,
  "The development preview must not write learning progress or gamification.",
);

const productionCatalogSource = read("lib/exercises/exercise-catalog.ts");
assert.doesNotMatch(
  productionCatalogSource,
  /section-one-v2-preview/,
  "Preview exercises must not enter the production lesson catalog.",
);

console.log(
  "Section 1 V2 UI check passed: four extended renderers, shared contexts, isolated development preview, and production catalog safety are wired.",
);
