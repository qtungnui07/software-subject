import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const assert = (condition: unknown, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

const roadmapSource = read("components/learn/course-roadmap.tsx");
const nodeSource = read("components/learn/roadmap-node.tsx");
const learningPopoverSource = read(
  "components/learn/roadmap-node-popover.tsx",
);
const rewardPopoverSource = read(
  "components/learn/roadmap-reward-popover.tsx",
);
const packageSource = read("package.json");

const forbiddenUserFacingLabels = [
  "Lộ trình Coddy-style",
  "LỘ TRÌNH CODDY-STYLE",
  "Lộ trình Coddy",
  "Lộ trình Robogo",
];

for (const label of forbiddenUserFacingLabels) {
  assert(
    !roadmapSource.includes(label),
    `CourseRoadmap must not render the redundant label: ${label}`,
  );
}

assert(
  roadmapSource.includes("{section.chapter.title}") &&
    roadmapSource.includes(
      'className="mb-4 flex items-center px-1 sm:px-3"',
    ),
  "CourseRoadmap must keep the real chapter title with compact heading spacing.",
);
assert(
  roadmapSource.includes('data-course-roadmap="coddy-integration"') &&
    roadmapSource.includes("<RoadmapNode") &&
    roadmapSource.includes("<RoadmapNodePopover") &&
    roadmapSource.includes("<RoadmapRewardPopover"),
  "Copy cleanup must not remove the roadmap shell, nodes, or popovers.",
);
assert(
  nodeSource.includes("course-roadmap-node__face") &&
    learningPopoverSource.includes(
      'data-course-roadmap-popover-kind="learning"',
    ) &&
    rewardPopoverSource.includes(
      'data-course-roadmap-reward-popover="freeze"',
    ),
  "Copy cleanup must preserve node and popover behavior.",
);
assert(
  packageSource.includes(
    '"check:roadmap-copy-cleanup": "tsx scripts/check-roadmap-copy-cleanup.ts"',
  ),
  "package.json must expose check:roadmap-copy-cleanup.",
);

console.log(
  "Roadmap copy cleanup check passed: the Coddy-style label is removed, the chapter title and compact spacing remain, and roadmap nodes/popovers are unchanged.",
);
