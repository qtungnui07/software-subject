import {
  getLearningNodeById,
  getSectionForNode,
} from "@/lib/courses/course-catalog";
import {
  isNodePrerequisiteSatisfied,
  isSectionUnlocked,
} from "@/lib/courses/course-unlock-policy";
import {
  normalizeCourseProgressState,
  type CourseProgressState,
} from "@/lib/courses/course-progress";
import type {
  CourseDefinition,
  CourseRewardDefinition,
} from "@/types/course";

export type CourseRewardClaimReason =
  | "updated"
  | "already-claimed"
  | "invalid-node"
  | "not-chest"
  | "locked-section"
  | "locked-node"
  | "missing-reward"
  | "unsupported-reward";

export type CourseRewardClaimMutationResult = {
  progress: CourseProgressState;
  changed: boolean;
  reason: CourseRewardClaimReason;
  nodeId: string;
  reward?: CourseRewardDefinition;
  alreadyClaimed: boolean;
};

const isSupportedReward = (reward: CourseRewardDefinition) => {
  return (
    reward.type === "streak_freeze" &&
    Number.isInteger(reward.amount) &&
    reward.amount > 0
  );
};

export const claimCourseReward = (
  state: CourseProgressState,
  nodeId: string,
  course: CourseDefinition,
): CourseRewardClaimMutationResult => {
  const normalizedState = normalizeCourseProgressState(state, course);
  const node = getLearningNodeById(course, nodeId);

  if (!node) {
    return {
      progress: normalizedState,
      changed: false,
      reason: "invalid-node",
      nodeId,
      alreadyClaimed: false,
    };
  }

  if (node.type !== "chest") {
    return {
      progress: normalizedState,
      changed: false,
      reason: "not-chest",
      nodeId: node.id,
      alreadyClaimed: false,
    };
  }

  const section = getSectionForNode(course, node.id);
  if (!section || !isSectionUnlocked(normalizedState, section.id)) {
    return {
      progress: normalizedState,
      changed: false,
      reason: "locked-section",
      nodeId: node.id,
      alreadyClaimed: false,
    };
  }

  if (!isNodePrerequisiteSatisfied(normalizedState, node, course)) {
    return {
      progress: normalizedState,
      changed: false,
      reason: "locked-node",
      nodeId: node.id,
      alreadyClaimed: false,
    };
  }

  const reward = node.rewards?.[0];
  if (!reward) {
    return {
      progress: normalizedState,
      changed: false,
      reason: "missing-reward",
      nodeId: node.id,
      alreadyClaimed: false,
    };
  }

  if (!isSupportedReward(reward)) {
    return {
      progress: normalizedState,
      changed: false,
      reason: "unsupported-reward",
      nodeId: node.id,
      reward,
      alreadyClaimed: false,
    };
  }

  if (normalizedState.claimedRewardNodeIds.includes(node.id)) {
    return {
      progress: normalizedState,
      changed: false,
      reason: "already-claimed",
      nodeId: node.id,
      reward,
      alreadyClaimed: true,
    };
  }

  return {
    progress: normalizeCourseProgressState(
      {
        ...normalizedState,
        claimedRewardNodeIds: [...normalizedState.claimedRewardNodeIds, node.id],
        updatedAt: new Date().toISOString(),
      },
      course,
    ),
    changed: true,
    reason: "updated",
    nodeId: node.id,
    reward,
    alreadyClaimed: false,
  };
};
