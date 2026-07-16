import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const readSource = (relativePath: string) =>
  readFileSync(resolve(root, relativePath), "utf8");

const buttonSource = readSource("components/ui/button.tsx");
const lessonSource = readSource("app/lesson/page.tsx");
const detailSource = readSource("components/lesson/course-lesson-detail.tsx");

assert.match(
  buttonSource,
  /lessonPrimary:\s*\n\s*"[^"]*bg-\[#1486CC\][^"]*"/,
  "Button must expose a dedicated lessonPrimary variant using Robogo blue.",
);
assert.match(
  buttonSource,
  /lessonPrimary:[\s\S]*disabled:bg-\[#9bd3f1\][\s\S]*disabled:opacity-100/,
  "The lesson action variant must keep a clearly blue disabled state.",
);
assert.match(
  buttonSource,
  /secondary:\s*\n\s*"bg-green-500/,
  "The shared secondary variant must remain green for existing non-lesson UI.",
);
assert.match(
  buttonSource,
  /danger:\s*\n\s*"bg-rose-500/,
  "The shared danger variant must remain red for destructive UI.",
);

const lessonPrimaryUses = lessonSource.match(/variant="lessonPrimary"/g) ?? [];
assert.equal(
  lessonPrimaryUses.length,
  2,
  "Lesson Player must use lessonPrimary for both Check and Continue/Complete actions.",
);
assert.doesNotMatch(
  lessonSource,
  /variant=\{answerComplete \? "secondary" : "default"\}/,
  "The Check button must no longer switch between default and green variants.",
);
assert.doesNotMatch(
  lessonSource,
  /variant=\{isCorrect \? "secondary" : "danger"\}/,
  "Continue/Complete must not use answer correctness to choose its button color.",
);
assert.match(lessonSource, />\s*Kiểm tra\s*</, "The Check action must remain wired.");
assert.match(lessonSource, /\? "Hoàn thành"\s*:\s*"Tiếp tục"/, "Continue and Complete labels must remain wired.");
assert.match(
  lessonSource,
  /isCorrect \? "border-green-200 bg-green-50[\s\S]*"border-rose-200 bg-rose-50/,
  "Correct and incorrect feedback backgrounds must remain green and red.",
);
assert.match(
  lessonSource,
  /disabled=\{!answerComplete\}/,
  "The Check button must remain disabled until the answer is complete.",
);

assert.match(
  detailSource,
  /<Button asChild variant="lessonPrimary"/,
  "Unlocked lesson detail CTAs must use lessonPrimary.",
);
assert.match(
  detailSource,
  /<Button disabled variant="lessonPrimary"/,
  "Locked lesson detail CTAs must use the branded disabled state.",
);
assert.match(
  detailSource,
  /<Link href=\{detail\.playerHref\}>\{detail\.actionLabel\}<\/Link>/,
  "The shared lesson detail CTA must keep its player route and dynamic label.",
);

console.log(
  "Lesson action theme check passed: Check, Continue, Complete, and lesson-detail CTAs use Robogo blue while correct/incorrect feedback stays green/red and shared button variants remain unchanged.",
);
