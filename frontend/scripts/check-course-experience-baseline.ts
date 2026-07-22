import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { englishCourse } from "@/data/courses/english-course";
import { canAccessCourseNode } from "@/lib/courses/course-unlock-policy";
import {
  createDefaultCourseProgress,
  getCurrentNodeIdForSection,
  type CourseProgressState,
} from "@/lib/courses/course-progress";
import { validateCourseDefinition } from "@/lib/courses/course-validator";

const root = process.cwd();
const resolve = (path: string) => join(root, path);
const read = (path: string) => readFileSync(resolve(path), "utf8");

const requiredFiles = [
  "app/api/study-time/route.ts",
  "app/lesson/page.tsx",
  "app/(main)/lesson/[lessonId]/page.tsx",
  "components/lesson-study-timer.tsx",
  "components/learn/course-roadmap.tsx",
  "components/learn/course-learn-client.tsx",
  "app/(main)/learn/header.tsx",
  "app/(main)/sections/page.tsx",
  "components/learn/roadmap-node.tsx",
  "components/learn/roadmap-node-popover.tsx",
  "components/learn/roadmap-reward-popover.tsx",
  "components/use-study-time-summary.ts",
  "public/Robogo.svg",
  "constants/user-avatar.ts",
  "services/study-time-service.ts",
] as const;

for (const path of requiredFiles) {
  assert.equal(existsSync(resolve(path)), true, `Missing baseline file: ${path}`);
}

const studyTimeServiceSource = read("services/study-time-service.ts");
const studyTimeRouteSource = read("app/api/study-time/route.ts");
const lessonTimerSource = read("components/lesson-study-timer.tsx");
const roadmapSource = read("components/learn/course-roadmap.tsx");
const roadmapNodeSource = read("components/learn/roadmap-node.tsx");
const popoverSource = read("components/learn/roadmap-node-popover.tsx");
const rewardPopoverSource = read("components/learn/roadmap-reward-popover.tsx");
const lessonDetailPageSource = read("app/(main)/lesson/[lessonId]/page.tsx");
const learnClientSource = read("components/learn/course-learn-client.tsx");
const learnHeaderSource = read("app/(main)/learn/header.tsx");
const lessonPlayerSource = read("app/lesson/page.tsx");
const packageSource = read("package.json");
const robogoLogoSource = read("public/Robogo.svg");
const avatarConstantSource = read("constants/user-avatar.ts");

assert.match(
  studyTimeServiceSource,
  /export type StudyTimeSummary[\s\S]*totalSeconds:\s*number;[\s\S]*todaySeconds:\s*number;/,
  "StudyTimeSummary must preserve both cumulative and daily study time.",
);
assert.match(
  studyTimeRouteSource,
  /export async function GET\(\)/,
  "Study-time API must keep its authenticated read endpoint.",
);
assert.match(
  studyTimeRouteSource,
  /export async function POST\(req: Request\)/,
  "Study-time API must keep its tracking endpoint.",
);
assert(
  studyTimeRouteSource.includes("durationSeconds <= 0") &&
    studyTimeRouteSource.includes('status: 401'),
  "Study-time API must reject invalid durations and unauthenticated access.",
);
assert(
  lessonTimerSource.includes("getAfkInactivityLimitMs") &&
    lessonTimerSource.includes('document.visibilityState === "hidden"') &&
    lessonTimerSource.includes("pendingSecondsRef.current += 1") &&
    lessonTimerSource.includes("flushStudyTime"),
  "Lesson timer must preserve AFK handling, hidden-tab flushing, active-second counting, and server sync.",
);

const courseValidation = validateCourseDefinition(englishCourse);
assert.equal(
  courseValidation.valid,
  true,
  `English course baseline is invalid:\n${courseValidation.errors.join("\n")}`,
);
assert.equal(
  englishCourse.sections.length,
  3,
  "English course must keep exactly three sections in the current scope.",
);
assert(
  englishCourse.sections.every(
    (section) =>
      section.contentStatus === "ready" &&
      section.chapter.order === 1 &&
      section.chapter.nodes.length > 0,
  ),
  "Every English section must remain ready with one populated MVP chapter.",
);

const sectionIds = englishCourse.sections.map((section) => section.id);
const nodeIds = englishCourse.sections.flatMap((section) =>
  section.chapter.nodes.map((node) => node.id),
);
assert.equal(
  new Set(sectionIds).size,
  sectionIds.length,
  "Section IDs must remain unique.",
);
assert.equal(
  new Set(nodeIds).size,
  nodeIds.length,
  "Learning node IDs must remain globally unique.",
);

const fullyUnlockedProgress: CourseProgressState = {
  ...createDefaultCourseProgress("english"),
  unlockedSectionIds: sectionIds,
  onboardingStatus: "completed",
};

for (const section of englishCourse.sections) {
  const orderedNodes = [...section.chapter.nodes].sort(
    (left, right) => left.order - right.order,
  );
  const firstLearningNode = orderedNodes.find((node) => node.type !== "chest");
  const chest = orderedNodes.find((node) => node.type === "chest");
  const checkpoint = orderedNodes.find((node) => node.type === "checkpoint");

  assert(firstLearningNode, `${section.id} must contain a learning node.`);
  assert(chest, `${section.id} must keep its optional Freeze chest.`);
  assert(checkpoint, `${section.id} must keep its checkpoint.`);
  assert.equal(chest.href, null, `${section.id} chest must stay on the roadmap.`);
  assert.equal(
    getCurrentNodeIdForSection(fullyUnlockedProgress, section.id),
    firstLearningNode.id,
    `${section.id} must resolve its first unfinished learning node.`,
  );

  const lessonAfterChest = orderedNodes.find(
    (node) => node.type === "lesson" && node.order > chest.order,
  );
  assert(lessonAfterChest, `${section.id} must contain a lesson after its chest.`);

  const prerequisiteId = lessonAfterChest.unlockAfterId;
  const completedNodeIds = prerequisiteId ? [prerequisiteId] : [];
  const progressedState: CourseProgressState = {
    ...fullyUnlockedProgress,
    currentSectionId: section.id,
    completedNodeIds,
  };

  assert.equal(
    canAccessCourseNode(progressedState, lessonAfterChest.id),
    true,
    `${section.id} optional chest must not block the next lesson.`,
  );

  for (const node of orderedNodes.filter((item) => item.type !== "chest")) {
    assert(node.href, `${node.id} must keep an internal navigation target.`);
    assert(
      node.href.startsWith("/lesson?id=") ||
        node.href.startsWith("/lesson/") ||
        node.href.startsWith("/checkpoint/"),
      `${node.id} must navigate through a supported Robogo learning route.`,
    );
  }
}

assert(
  roadmapNodeSource.includes("<button") &&
    roadmapNodeSource.includes("onSelect();") &&
    !roadmapNodeSource.includes("<Link"),
  "Clicking a roadmap node must open UI state instead of navigating immediately.",
);
assert(
  roadmapSource.includes("selectedNodeId") &&
    roadmapSource.includes("<RoadmapNodePopover") &&
    roadmapSource.includes("onClaimReward={handleClaimReward}"),
  "Roadmap must keep node popovers and in-place reward claiming.",
);
assert(
  popoverSource.includes("view.href && !isLocked") &&
    popoverSource.includes("href={view.href}") &&
    rewardPopoverSource.includes("onClaimReward?.(view.node.id)"),
  "Learning popovers must keep detail navigation while reward popovers claim Freeze directly on the roadmap.",
);
assert(
  (lessonDetailPageSource.includes("CourseLessonDetail") ||
    lessonDetailPageSource.includes("LessonDetailClient")) &&
    lessonDetailPageSource.includes("notFound()"),
  "The lesson-detail route must remain available and reject unknown lessons.",
);
assert(
  lessonPlayerSource.includes("searchParams") || lessonPlayerSource.includes("useSearchParams"),
  "The lesson player must keep accepting a lesson identifier from the URL.",
);


assert.equal(
  existsSync(resolve("components/learn/section-switcher.tsx")),
  false,
  "The old inline section switcher must stay removed from /learn.",
);
assert(
  learnClientSource.includes("courseProgress.currentSectionId") &&
    !learnClientSource.includes("SectionSwitcher"),
  "/learn must render only the persisted current section.",
);
assert(
  learnHeaderSource.includes('href="/sections"') &&
    learnHeaderSource.indexOf("</Link>") <
      learnHeaderSource.indexOf("<GuideDialog"),
  "The blue lesson header must open /sections without capturing the Guide action.",
);

assert.match(robogoLogoSource, /<svg\b/i, "public/Robogo.svg must be a valid SVG asset.");
assert(
  avatarConstantSource.includes('DEFAULT_USER_AVATAR = "/Robogo.svg"'),
  "Robogo.svg must remain the shared default user avatar.",
);
assert(
  packageSource.includes(
    '"check:course-experience-baseline": "tsx scripts/check-course-experience-baseline.ts"',
  ),
  "package.json must expose check:course-experience-baseline.",
);

const allSourcePaths = [
  "auth.ts",
  "components/learn/course-roadmap.tsx",
  "components/learn/course-learn-client.tsx",
  "app/(main)/learn/header.tsx",
  "app/(main)/sections/page.tsx",
  "components/use-study-time-summary.ts",
  "constants/chapter-one.ts",
  "data/courses/english-course.ts",
  "services/study-time-service.ts",
];
const combinedSource = allSourcePaths.map(read).join("\n");
const knownGaps = {
  directPlayerLessonLinks: (combinedSource.match(/\/lesson\?id=/g) ?? []).length,
};

assert(
  !combinedSource.includes("Lộ trình Coddy-style"),
  "The old Coddy-style roadmap label must stay removed from the user-facing roadmap.",
);

console.log(
  "Course experience baseline check passed: study-time storage, current-section navigation, 3-section course integrity, node popovers, lesson routes, and Robogo.svg are protected.",
);
console.log(
  `Known remaining gaps recorded without changing behavior: ${knownGaps.directPlayerLessonLinks} direct player link(s).`,
);
