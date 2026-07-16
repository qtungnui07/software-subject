import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { normalizeCourseProgressState } from "@/lib/courses/course-progress";

const root = process.cwd();
const resolve = (filePath: string) => join(root, filePath);
const read = (filePath: string) => readFileSync(resolve(filePath), "utf8");

const learnPageSource = read("app/(main)/learn/page.tsx");
const learnClientSource = read("components/learn/course-learn-client.tsx");
const headerSource = read("app/(main)/learn/header.tsx");
const sectionsPageSource = read("app/(main)/sections/page.tsx");
const sectionsClientSource = read("app/(main)/sections/sections-client.tsx");
const sectionCardSource = read("components/sections/section-card.tsx");
const lessonPlayerSource = read("app/lesson/page.tsx");
const onboardingSource = read("app/onboarding/onboarding-client.tsx");
const placementResultSource = read(
  "app/placement-test/result/placement-result-client.tsx",
);
const progressServiceSource = read("services/course-progress-service.ts");
const packageSource = read("package.json");

assert.equal(
  existsSync(resolve("components/learn/section-switcher.tsx")),
  false,
  "The legacy SectionSwitcher must be removed after /sections becomes the only picker.",
);
assert.equal(
  existsSync(resolve("components/learn/locked-section-panel.tsx")),
  false,
  "The dead locked-section branch must be removed from /learn.",
);

assert.doesNotMatch(learnClientSource, /SectionSwitcher/);
assert.doesNotMatch(learnClientSource, /selectedSectionId/);
assert.doesNotMatch(learnClientSource, /handleSelectSection/);
assert.doesNotMatch(
  learnClientSource,
  /\/api\/progress\/course\/select-section/,
);
assert.match(
  learnClientSource,
  /section\.id === courseProgress\.currentSectionId/,
  "/learn must render only the persisted current section.",
);
assert.match(learnClientSource, /<Header/);
assert.match(learnClientSource, /<SectionLearningPath/);

assert.match(headerSource, /href="\/sections"/);
assert.match(headerSource, /aria-label="Xem các phần học"/);
assert.match(headerSource, /<Layers3/);
assert.match(headerSource, /<ChevronRight/);
assert.match(headerSource, /<GuideDialog \/>/);
assert(
  headerSource.indexOf("</Link>") < headerSource.indexOf("<GuideDialog"),
  "GuideDialog must remain outside the /sections Link click area.",
);

assert.match(learnPageSource, /params\.section \?\? params\.locked/);
assert.match(learnPageSource, /\/sections\?requested=/);
assert.doesNotMatch(learnPageSource, /initialSelectedSectionId/);
assert.doesNotMatch(learnPageSource, /recommendedSectionId/);

assert.match(sectionsPageSource, /searchParams\?: Promise<\{ requested\?: string \}>/);
assert.match(sectionsPageSource, /requestedSectionId=/);
assert.match(sectionsClientSource, /scrollIntoView/);
assert.match(sectionsClientSource, /setHighlightedSectionId\(null\)/);
assert.match(sectionCardSource, /id=\{`section-card-\$\{section\.id\}`\}/);
assert.match(sectionCardSource, /highlighted &&/);

assert.match(lessonPlayerSource, /\/sections\?requested=/);
assert.match(
  lessonPlayerSource,
  /const redirectToLearn = \(\) => \{\s*router\.push\("\/learn"\);/,
);
assert.doesNotMatch(lessonPlayerSource, /\/learn\?section=/);
assert.doesNotMatch(onboardingSource, /\/learn\?section=/);
assert.doesNotMatch(placementResultSource, /\/learn\?section=/);

assert.match(progressServiceSource, /shouldRepairCurrentSection/);
assert.match(
  progressServiceSource,
  /row\.currentSectionId !== existingState\.currentSectionId/,
);
assert.match(
  progressServiceSource,
  /persistCourseProgress\(userId, existingState\)/,
);

const repaired = normalizeCourseProgressState({
  courseId: "english",
  currentSectionId: "missing-section",
  unlockedSectionIds: ["english-section-1", "english-section-2"],
});
assert.equal(
  repaired.currentSectionId,
  "english-section-2",
  "Invalid stored section IDs must recover to the highest unlocked section.",
);

assert.match(
  packageSource,
  /"check:learn-sections-integration": "tsx scripts\/check-learn-sections-integration\.ts"/,
);

console.log(
  "Learn sections integration check passed: /learn renders only currentSectionId, the blue header opens /sections without capturing Guide, legacy section queries become advisory highlights, and invalid stored sections repair safely.",
);
