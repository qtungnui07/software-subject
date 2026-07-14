import { readFileSync } from "node:fs";
import { join } from "node:path";

import { englishCourse } from "@/data/courses/english-course";
import { canAccessCourseNode } from "@/lib/courses/course-unlock-policy";
import {
  createDefaultCourseProgress,
  getCurrentNodeIdForSection,
  type CourseProgressState,
} from "@/lib/courses/course-progress";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const clientSource = read("components/learn/course-learn-client.tsx");
const roadmapSource = read("components/learn/course-roadmap.tsx");
const nodeSource = read("components/learn/roadmap-node.tsx");
const popoverSource = read("components/learn/roadmap-node-popover.tsx");
const connectorSource = read("components/learn/roadmap-connector.tsx");
const sectionWrapperSource = read("components/learn/section-learning-path.tsx");
const legacyWrapperSource = read("components/lesson-path.tsx");
const cssSource = read("app/globals.css");
const packageSource = read("package.json");

assert(
  clientSource.includes("<SectionLearningPath") &&
    clientSource.includes("onClaimReward={handleClaimReward}") &&
    clientSource.includes("POST") &&
    clientSource.includes("/api/progress/course/claim-reward"),
  "CourseLearnClient must wire the real /learn flow into SectionLearningPath and the reward claim API.",
);
assert(
  sectionWrapperSource.includes("<CourseRoadmap") &&
    legacyWrapperSource.includes("<CourseRoadmap"),
  "SectionLearningPath and legacy LessonPath must both delegate to CourseRoadmap.",
);
assert(
  !sectionWrapperSource.includes("rounded-full") &&
    !legacyWrapperSource.includes("rounded-full") &&
    !sectionWrapperSource.includes("space-y-8"),
  "Old round-node/card roadmap UI must not remain in the wrappers.",
);
assert(
  roadmapSource.includes("scrollIntoView") &&
    roadmapSource.includes("behavior: \"smooth\"") &&
    roadmapSource.includes("Escape") &&
    roadmapSource.includes("data-course-roadmap=\"coddy-integration\""),
  "CourseRoadmap must auto-scroll to the active node and close popovers with Escape/outside clicks.",
);
assert(
  !roadmapSource.includes("await onClaimReward(nodeId);\n      setSelectedNodeId(null);") &&
    roadmapSource.includes("claimingNodeId") &&
    popoverSource.includes("ĐANG NHẬN...") &&
    popoverSource.includes("aria-busy={claiming}"),
  "Reward claim must keep the popup live, show loading, and update to claimed state without closing immediately.",
);
assert(
  nodeSource.includes("data-roadmap-node=\"coddy-3d\"") &&
    nodeSource.includes("data-roadmap-node-state={view.state}") &&
    nodeSource.includes("aria-current={view.state === \"current\""),
  "RoadmapNode must expose integrated state markers and accessible current-node metadata.",
);
assert(
  connectorSource.includes("data-course-roadmap-connector=\"state-aware\"") &&
    connectorSource.includes("courseRoadmapCompletedPath") &&
    connectorSource.includes("data-course-roadmap-segment={segment.status}"),
  "RoadmapConnector must style completed, active, and locked segments from node state.",
);
assert(
  popoverSource.includes("getLockedMessage") &&
    popoverSource.includes("data-course-roadmap-popover=\"coddy-small\""),
  "Roadmap popovers must use the small Coddy-style contract and explain locked reward/checkpoint states.",
);
assert(
  cssSource.includes(".course-roadmap-node-anchor") &&
    cssSource.includes(".course-roadmap-popover::before") &&
    cssSource.includes(".course-roadmap-action:disabled") &&
    cssSource.includes("@media (max-width: 640px)") &&
    cssSource.includes("width: min(286px, calc(100vw - 32px))"),
  "Roadmap CSS must include scroll margins, popover arrow, disabled claim state, and mobile popover sizing.",
);
assert(
  packageSource.includes("check:course-roadmap-integration"),
  "package.json must expose check:course-roadmap-integration.",
);

const unlockedProgress: CourseProgressState = {
  ...createDefaultCourseProgress("english"),
  unlockedSectionIds: englishCourse.sections.map((section) => section.id),
  onboardingStatus: "completed",
};

for (const section of englishCourse.sections) {
  const nodes = [...section.chapter.nodes].sort(
    (left, right) => left.order - right.order,
  );
  const chest = nodes.find((node) => node.type === "chest");
  const lessonThree = nodes.find(
    (node) => node.type === "lesson" && node.order === 3,
  );
  const lessonFour = nodes.find(
    (node) => node.type === "lesson" && node.order > (chest?.order ?? 4),
  );

  if (!chest) {
    throw new Error(`${section.id} must include a Freeze chest.`);
  }
  if (!lessonThree) {
    throw new Error(`${section.id} must include Lesson 3 before the chest.`);
  }
  if (!lessonFour) {
    throw new Error(`${section.id} must include a lesson after the chest.`);
  }

  const completedThroughLessonThree: CourseProgressState = {
    ...unlockedProgress,
    currentSectionId: section.id,
    completedNodeIds: nodes
      .filter((node) => node.type === "lesson" && node.order <= 3)
      .map((node) => node.id),
  };

  assert(
    canAccessCourseNode(completedThroughLessonThree, lessonFour.id),
    `${section.id} Lesson 4 must remain accessible without claiming the optional Freeze chest.`,
  );
  assert(
    getCurrentNodeIdForSection(completedThroughLessonThree, section.id) ===
      lessonFour.id,
    `${section.id} continue target must skip the optional Freeze chest.`,
  );

  const claimedProgress: CourseProgressState = {
    ...completedThroughLessonThree,
    claimedRewardNodeIds: [chest.id],
  };

  assert(
    getCurrentNodeIdForSection(claimedProgress, section.id) === lessonFour.id,
    `${section.id} claiming the Freeze chest must not change the lesson continue target.`,
  );
}

console.log(
  "Course roadmap integration check passed: /learn uses the shared Coddy roadmap, current-node scroll and popover behavior are wired, reward claims update in place, and optional Freeze chests do not block lessons.",
);
