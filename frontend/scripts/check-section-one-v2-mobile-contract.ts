import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const matchPairs = read(
  "components/lesson/exercises/match-pairs-exercise.tsx",
);
assert.match(matchPairs, /activeLeftId/);
assert.match(matchPairs, /createPair/);
assert.doesNotMatch(
  matchPairs,
  /draggable=|onDragStart|onDrop=/,
  "Match Pairs must support tap-to-pair without mandatory drag and drop.",
);
assert.match(matchPairs, /aria-label/);
assert.match(matchPairs, /min-h-14|size-11/);

const arrangeDialogue = read(
  "components/lesson/exercises/arrange-dialogue-exercise.tsx",
);
assert.match(arrangeDialogue, /ArrowUp/);
assert.match(arrangeDialogue, /ArrowDown/);
assert.match(arrangeDialogue, /moveLine/);
assert.match(arrangeDialogue, /removeLine/);
assert.doesNotMatch(
  arrangeDialogue,
  /draggable=|onDragStart|onDrop=/,
  "Arrange Dialogue must remain usable without drag and drop.",
);
assert.match(arrangeDialogue, /aria-label/);

const rewrite = read(
  "components/lesson/exercises/sentence-rewrite-exercise.tsx",
);
assert.match(rewrite, /textarea/);
assert.match(rewrite, /requiredWords/);
assert.match(rewrite, /focus:ring/);

const writing = read(
  "components/lesson/exercises/short-writing-exercise.tsx",
);
assert.match(writing, /countWords/);
assert.match(writing, /matchedWords/);
assert.match(writing, /minimumSuggestedWordMatches/);
assert.match(writing, /textarea/);

const context = read("components/lesson/exercise-context-card.tsx");
assert.match(context, /0\.8×/);
assert.match(context, /1×/);
assert.match(context, /preload="none"/);
assert.doesNotMatch(context, /autoPlay/);
assert.match(context, /aria-label="Tốc độ phát bài nghe"/);

console.log(
  "Section 1 V2 mobile contract check passed: tap pairing, button-based dialogue ordering, accessible text input, word feedback, and non-autoplay listening are present.",
);
