import { readFileSync } from "node:fs";
import { join } from "node:path";

import { englishCourse } from "@/data/courses/english-course";
import {
  canAccessCourseNode,
  isNodePrerequisiteSatisfied,
} from "@/lib/courses/course-unlock-policy";
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

const componentSource = read("components/learn/course-roadmap.tsx");
const nodeSource = read("components/learn/roadmap-node.tsx");
const popoverSource = read("components/learn/roadmap-node-popover.tsx");
const connectorSource = read("components/learn/roadmap-connector.tsx");
const sectionWrapperSource = read("components/learn/section-learning-path.tsx");
const legacyWrapperSource = read("components/lesson-path.tsx");
const clientSource = read("components/learn/course-learn-client.tsx");
const cssSource = read("app/globals.css");
const packageSource = read("package.json");

assert(
  sectionWrapperSource.includes("<CourseRoadmap") &&
    legacyWrapperSource.includes("<CourseRoadmap"),
  "Section and legacy learning paths must both render CourseRoadmap.",
);
assert(
  clientSource.includes("<SectionLearningPath") &&
    clientSource.includes("onClaimReward={handleClaimReward}"),
  "CourseLearnClient must route all selected English sections through the shared roadmap and reward claim handler.",
);
assert(
  !sectionWrapperSource.includes("rounded-full") &&
    !sectionWrapperSource.includes("space-y-8"),
  "SectionLearningPath must not keep the old horizontal card or round-node implementation.",
);
assert(
  nodeSource.includes("course-roadmap-node__base") &&
    nodeSource.includes("course-roadmap-node__face") &&
    nodeSource.includes("course-roadmap-node__base-depth") &&
    nodeSource.includes("course-roadmap-node__face-depth") &&
    cssSource.includes("polygon(50% 0%, 93% 25%"),
  "Roadmap nodes must use Tuấn Anh's layered hexagonal 3D shape.",
);
assert(
  cssSource.includes("course-roadmap-idle") &&
    cssSource.includes("course-roadmap-shimmer") &&
    cssSource.includes("course-roadmap-popover-in"),
  "Roadmap CSS must include idle, reward shimmer, and popover animations.",
);
assert(
  componentSource.includes("rewardAvailable") &&
    componentSource.includes("rewardClaimed") &&
    componentSource.includes("checkpointAvailable") &&
    popoverSource.includes("NHẬN FREEZE"),
  "Roadmap must support reward and checkpoint states with a Freeze claim action.",
);
assert(
  connectorSource.includes("strokeDasharray") &&
    connectorSource.includes("courseRoadmapActivePath"),
  "Roadmap connector must support active and locked path styling.",
);
assert(
  packageSource.includes("check:course-roadmap-ui"),
  "package.json must expose check:course-roadmap-ui.",
);

const progressWithSectionUnlocks: CourseProgressState = {
  ...createDefaultCourseProgress("english"),
  unlockedSectionIds: englishCourse.sections.map((section) => section.id),
  onboardingStatus: "completed",
};

for (const section of englishCourse.sections) {
  const nodes = [...section.chapter.nodes].sort(
    (left, right) => left.order - right.order,
  );
  const chest = nodes.find((node) => node.type === "chest");
  const checkpoint = nodes.find((node) => node.type === "checkpoint");

  assert(
    chest,
    `${section.id} must keep one Freeze chest for the new roadmap.`,
  );
  assert(
    checkpoint,
    `${section.id} must keep one checkpoint for the new roadmap.`,
  );
  assert(
    chest?.rewards?.[0]?.type === "streak_freeze",
    `${section.id} chest must expose Freeze reward metadata.`,
  );

  const completedThroughLesson3: CourseProgressState = {
    ...progressWithSectionUnlocks,
    currentSectionId: section.id,
    completedNodeIds: nodes
      .filter((node) => node.type === "lesson" && node.order <= 3)
      .map((node) => node.id),
  };

  assert(
    chest && isNodePrerequisiteSatisfied(completedThroughLesson3, chest),
    `${section.id} chest must become available after Lesson 3.`,
  );

  const lessonFour = nodes.find(
    (node) => node.type === "lesson" && node.order > 4,
  );
  if (!lessonFour) {
    throw new Error(`${section.id} must have a lesson after the Freeze chest.`);
  }
  assert(
    canAccessCourseNode(completedThroughLesson3, lessonFour.id),
    `${section.id} Lesson 4 must stay accessible without claiming the optional chest.`,
  );
  assert(
    getCurrentNodeIdForSection(completedThroughLesson3, section.id) ===
      lessonFour.id,
    `${section.id} continue target must skip optional Freeze chest.`,
  );
}

console.log(
  "Course roadmap UI check passed: all 3 English sections use the shared Coddy-style 3D roadmap, Freeze chests stay optional, and roadmap states/actions are wired.",
);
