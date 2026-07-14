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

const roadmapSource = read("components/learn/course-roadmap.tsx");
const nodeSource = read("components/learn/roadmap-node.tsx");
const popoverSource = read("components/learn/roadmap-node-popover.tsx");
const modalSource = read("components/learn/reward-claim-modal.tsx");
const toastSource = read("components/learn/reward-claim-toast.tsx");
const cssSource = read("app/globals.css");
const packageSource = read("package.json");

assert(
  roadmapSource.includes("<RewardClaimModal") &&
    roadmapSource.includes("<RewardClaimToast") &&
    roadmapSource.includes("setClaimedRewardModal") &&
    roadmapSource.includes("setClaimedRewardToast"),
  "CourseRoadmap must open the reward modal and toast after a successful Freeze claim.",
);
assert(
  roadmapSource.includes("await onClaimReward(nodeId)") &&
    roadmapSource.includes("setCelebratedRewardNodeId(nodeId)") &&
    roadmapSource.includes("setSelectedNodeId(nodeId)"),
  "Reward claims must still use the Phase 2 API handler and keep the claimed chest selected for feedback.",
);
assert(
  nodeSource.includes("celebrated?: boolean") &&
    nodeSource.includes("course-roadmap-node--rewardCelebrated") &&
    nodeSource.includes("data-roadmap-reward-celebrated"),
  "RoadmapNode must expose a short claimed-state celebration for the chest node.",
);
assert(
  popoverSource.includes("disabled={claiming}") &&
    popoverSource.includes("ĐANG NHẬN...") &&
    popoverSource.includes("error ?"),
  "Reward popover must keep loading/error feedback and prevent double-click claim spam.",
);
assert(
  modalSource.includes("data-reward-claim-modal=\"freeze\"") &&
    modalSource.includes("Rương đã mở!") &&
    modalSource.includes("Freeze sẽ tự động bảo vệ chuỗi học") &&
    modalSource.includes("Tiếp tục"),
  "RewardClaimModal must clearly present the opened Freeze chest and continuation action.",
);
assert(
  toastSource.includes("data-reward-claim-toast=\"freeze\"") &&
    toastSource.includes("role=\"status\"") &&
    toastSource.includes("setTimeout(onDismiss, 2800)"),
  "RewardClaimToast must be accessible and auto-dismiss after the reward feedback.",
);
assert(
  cssSource.includes("reward-claim-modal-backdrop") &&
    cssSource.includes("reward-claim-modal__chest") &&
    cssSource.includes("reward-claim-modal__freeze") &&
    cssSource.includes("reward-claim-toast") &&
    cssSource.includes("course-roadmap-chest-shake") &&
    cssSource.includes("reward-claim-freeze-pop") &&
    cssSource.includes("reward-claim-toast-in") &&
    cssSource.includes("course-roadmap-node--rewardClaimed .course-roadmap-node__face::after"),
  "Reward polish CSS must include modal, toast, chest shake, Freeze pop/glow, and claimed chest shimmer shutdown.",
);
assert(
  !packageSource.includes("framer-motion") &&
    packageSource.includes("check:course-reward-polish"),
  "Phase 5 must avoid new animation dependencies and expose check:course-reward-polish.",
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
  const lessonFour = nodes.find(
    (node) => node.type === "lesson" && node.order > (chest?.order ?? 4),
  );

  if (!chest) {
    throw new Error(`${section.id} must keep one Freeze chest.`);
  }
  if (!lessonFour) {
    throw new Error(`${section.id} must keep a lesson after the Freeze chest.`);
  }

  const completedThroughLessonThree: CourseProgressState = {
    ...unlockedProgress,
    currentSectionId: section.id,
    completedNodeIds: nodes
      .filter((node) => node.type === "lesson" && node.order <= 3)
      .map((node) => node.id),
  };

  assert(
    isNodePrerequisiteSatisfied(completedThroughLessonThree, chest),
    `${section.id} Freeze chest must become available after Lesson 3.`,
  );
  assert(
    canAccessCourseNode(completedThroughLessonThree, lessonFour.id),
    `${section.id} Lesson 4 must stay accessible before claiming the optional Freeze chest.`,
  );
  assert(
    getCurrentNodeIdForSection(completedThroughLessonThree, section.id) ===
      lessonFour.id,
    `${section.id} continue target must skip optional Freeze chests after Phase 5 polish.`,
  );

  const claimedProgress: CourseProgressState = {
    ...completedThroughLessonThree,
    claimedRewardNodeIds: [chest.id],
  };

  assert(
    getCurrentNodeIdForSection(claimedProgress, section.id) === lessonFour.id,
    `${section.id} claimed Freeze chest must not become the continue target.`,
  );
}

console.log(
  "Course reward polish check passed: Freeze claim opens a modal and toast, chest animations are wired, claimed chests stop shimmering, and optional reward nodes still do not block lessons.",
);
