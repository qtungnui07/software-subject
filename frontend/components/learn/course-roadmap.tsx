"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { RoadmapConnector } from "@/components/learn/roadmap-connector";
import { RewardClaimModal } from "@/components/learn/reward-claim-modal";
import { RewardClaimToast } from "@/components/learn/reward-claim-toast";
import {
  RoadmapNode,
  type RoadmapNodeState,
  type RoadmapNodeView,
} from "@/components/learn/roadmap-node";
import { RoadmapNodePopover } from "@/components/learn/roadmap-node-popover";
import { RoadmapRewardPopover } from "@/components/learn/roadmap-reward-popover";
import {
  canAccessCourseNode,
  isNodePrerequisiteSatisfied,
  isSectionUnlocked,
} from "@/lib/courses/course-unlock-policy";
import {
  getCurrentNodeIdForSection,
  type CourseProgressState,
} from "@/lib/courses/course-progress";
import { cn } from "@/lib/utils";
import type { LearningNodeDefinition, SectionDefinition } from "@/types/course";

const nodeGap = 168;
const topPadding = 108;
const bottomPadding = 146;
const desktopOffsetPattern = [0, -8.5, 8.5, -5.5, 7.5, 0, -7, 7];
const mobileOffsetPattern = [0, -5, 5, -4, 4.5, 0, -4.5, 4.5];

const getRewardLabel = (node: LearningNodeDefinition) => {
  const reward = node.rewards?.[0];
  return reward ? reward.label : null;
};

const getNodeState = ({
  node,
  progress,
  section,
  currentNodeId,
}: {
  node: LearningNodeDefinition;
  progress: CourseProgressState;
  section: SectionDefinition;
  currentNodeId: string | null;
}): RoadmapNodeState => {
  const sectionUnlocked = isSectionUnlocked(progress, section.id);

  if (node.type === "chest") {
    if (progress.claimedRewardNodeIds.includes(node.id)) return "rewardClaimed";
    if (sectionUnlocked && isNodePrerequisiteSatisfied(progress, node)) {
      return "rewardAvailable";
    }
    return "rewardLocked";
  }

  if (node.type === "checkpoint") {
    if (progress.completedNodeIds.includes(node.id))
      return "checkpointCompleted";
    if (sectionUnlocked && canAccessCourseNode(progress, node.id))
      return "checkpointAvailable";
    return "checkpointLocked";
  }

  if (progress.completedNodeIds.includes(node.id)) return "completed";
  if (sectionUnlocked && canAccessCourseNode(progress, node.id)) {
    return node.id === currentNodeId ? "current" : "available";
  }

  return "locked";
};

const getLabel = (state: RoadmapNodeState) => {
  switch (state) {
    case "completed":
      return "Đã hoàn thành";
    case "current":
      return "Bài hiện tại";
    case "available":
      return "Có thể học";
    case "rewardAvailable":
      return "Rương Freeze";
    case "rewardClaimed":
      return "Đã nhận Freeze";
    case "rewardLocked":
      return "Rương đã khóa";
    case "checkpointAvailable":
      return "Checkpoint";
    case "checkpointCompleted":
      return "Checkpoint đã qua";
    case "checkpointLocked":
      return "Checkpoint đã khóa";
    default:
      return "Đã khóa";
  }
};

const getActionLabel = (
  node: LearningNodeDefinition,
  state: RoadmapNodeState,
) => {
  if (node.type === "chest") {
    if (state === "rewardAvailable") return "Nhận Freeze";
    if (state === "rewardClaimed") return "Đã nhận";
    return "Chưa mở khóa";
  }

  if (state === "checkpointCompleted") return "Xem kết quả";
  if (state === "checkpointAvailable") return "Xem checkpoint";
  if (state === "completed") return "Ôn tập";
  if (state === "current") return "Tiếp tục";
  if (state === "available") return "Xem bài học";

  return "Chưa mở khóa";
};

const getDetailHref = (node: LearningNodeDefinition) => {
  if (node.type === "chest") return null;

  return `/lesson/${encodeURIComponent(node.id)}`;
};

const getEstimatedMinutes = (
  node: LearningNodeDefinition,
  section: SectionDefinition,
) => {
  if (node.type === "checkpoint") return 12;
  if (node.type === "chest") return 0;

  return section.order === 1 ? 7 : 8;
};

const getLockedReason = (
  node: LearningNodeDefinition,
  state: RoadmapNodeState,
  orderedNodes: LearningNodeDefinition[],
) => {
  if (!isDisabled(state)) return null;

  const prerequisite = node.unlockAfterId
    ? orderedNodes.find((item) => item.id === node.unlockAfterId)
    : null;
  const prerequisiteTitle = prerequisite?.title ?? "bài học trước";

  if (node.type === "chest") {
    return `Hoàn thành “${prerequisiteTitle}” để mở rương Freeze.`;
  }

  if (node.type === "checkpoint") {
    return `Hoàn thành “${prerequisiteTitle}” để mở checkpoint.`;
  }

  return `Hoàn thành “${prerequisiteTitle}” để mở bài học này.`;
};

const isDisabled = (state: RoadmapNodeState) => {
  return (
    state === "locked" ||
    state === "rewardLocked" ||
    state === "checkpointLocked"
  );
};

const buildRoadmapViews = (
  section: SectionDefinition,
  progress: CourseProgressState,
  compact: boolean,
): { nodes: RoadmapNodeView[]; height: number } => {
  const orderedNodes = [...section.chapter.nodes].sort(
    (left, right) => left.order - right.order,
  );
  const currentNodeId = getCurrentNodeIdForSection(progress, section.id);
  const height =
    topPadding + bottomPadding + Math.max(0, orderedNodes.length - 1) * nodeGap;
  const offsetPattern = compact ? mobileOffsetPattern : desktopOffsetPattern;

  return {
    height,
    nodes: orderedNodes.map((node, index) => {
      const state = getNodeState({ node, progress, section, currentNodeId });
      const checkpointScore =
        node.type === "checkpoint"
          ? (progress.checkpointScores[node.id] ?? 0)
          : null;

      return {
        node,
        state,
        x: 50 + offsetPattern[index % offsetPattern.length],
        y: topPadding + index * nodeGap,
        label: getLabel(state),
        actionLabel: getActionLabel(node, state),
        href: getDetailHref(node),
        disabled: isDisabled(state),
        rewardLabel: getRewardLabel(node),
        checkpointScore,
        estimatedMinutes: getEstimatedMinutes(node, section),
        lockedReason: getLockedReason(node, state, orderedNodes),
      } satisfies RoadmapNodeView;
    }),
  };
};

type Props = {
  section: SectionDefinition;
  progress: CourseProgressState;
  todayMinutes: number;
  className?: string;
  onClaimReward?: (nodeId: string) => Promise<void> | void;
};

export const CourseRoadmap = ({
  section,
  progress,
  todayMinutes,
  className,
  onClaimReward,
}: Props) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [claimingNodeId, setClaimingNodeId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimedRewardModal, setClaimedRewardModal] = useState<{
    nodeId: string;
    rewardLabel: string;
  } | null>(null);
  const [claimedRewardToast, setClaimedRewardToast] = useState<string | null>(null);
  const [celebratedRewardNodeId, setCelebratedRewardNodeId] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const roadmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const syncCompactMode = () => setIsCompact(mediaQuery.matches);

    syncCompactMode();
    mediaQuery.addEventListener("change", syncCompactMode);
    return () => mediaQuery.removeEventListener("change", syncCompactMode);
  }, []);

  useEffect(() => {
    if (!selectedNodeId) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedNodeId(null);
    };
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      const selectedNodeElement = document.getElementById(
        `course-roadmap-node-${selectedNodeId}`,
      );
      const selectedPopoverElement = document.getElementById(
        `course-roadmap-popover-${selectedNodeId}`,
      );

      if (
        selectedNodeElement?.contains(target) ||
        selectedPopoverElement?.contains(target)
      ) {
        return;
      }

      setSelectedNodeId(null);
    };
    const focusTimer = window.setTimeout(() => {
      document
        .getElementById(`course-roadmap-popover-${selectedNodeId}`)
        ?.focus();
    }, 0);

    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [selectedNodeId]);

  const { nodes, height } = useMemo(
    () => buildRoadmapViews(section, progress, isCompact),
    [isCompact, progress, section],
  );
  const selectedNode =
    nodes.find((view) => view.node.id === selectedNodeId) ?? null;
  const focusNode =
    nodes.find((view) => view.state === "current") ??
    nodes.find((view) => view.state === "checkpointAvailable") ??
    nodes.find((view) => view.state === "available") ??
    null;
  const focusNodeId = focusNode?.node.id ?? null;

  useEffect(() => {
    if (!focusNodeId) return;

    const scrollTimer = window.setTimeout(() => {
      document
        .getElementById(`course-roadmap-node-${focusNodeId}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 120);

    return () => window.clearTimeout(scrollTimer);
  }, [focusNodeId, section.id]);

  useEffect(() => {
    if (!celebratedRewardNodeId) return;

    const clearTimer = window.setTimeout(
      () => setCelebratedRewardNodeId(null),
      1800,
    );
    return () => window.clearTimeout(clearTimer);
  }, [celebratedRewardNodeId]);

  const handleClaimReward = async (nodeId: string) => {
    if (!onClaimReward || claimingNodeId) return;

    setClaimingNodeId(nodeId);
    setClaimError(null);
    try {
      await onClaimReward(nodeId);
      const claimedView = nodes.find((view) => view.node.id === nodeId);
      const rewardLabel = claimedView?.rewardLabel ?? "+1 Streak Freeze";
      setClaimedRewardModal({ nodeId, rewardLabel });
      setClaimedRewardToast(`${rewardLabel} đã được thêm`);
      setCelebratedRewardNodeId(nodeId);
      setSelectedNodeId(nodeId);
    } catch (error) {
      setClaimError(
        error instanceof Error
          ? error.message
          : "Không thể nhận Freeze lúc này.",
      );
    } finally {
      setClaimingNodeId(null);
    }
  };

  return (
    <div
      ref={roadmapRef}
      data-course-roadmap="coddy-integration"
      data-course-roadmap-section={section.id}
      className={cn("course-roadmap-shell", className)}
    >
      <div className="course-roadmap-bg course-roadmap-bg--one" />
      <div className="course-roadmap-bg course-roadmap-bg--two" />
      <div className="course-roadmap-bg course-roadmap-bg--three" />

      <div className="mb-4 flex items-center px-1 sm:px-3">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">
          {section.chapter.title}
        </h2>
      </div>

      <div className="relative z-10 mx-auto max-w-[720px]" style={{ height }}>
        <RoadmapConnector nodes={nodes} height={height} />

        {nodes.map((view) => (
          <RoadmapNode
            key={view.node.id}
            view={view}
            selected={selectedNodeId === view.node.id}
            claiming={claimingNodeId === view.node.id}
            celebrated={celebratedRewardNodeId === view.node.id}
            onSelect={() => {
              setClaimError(null);
              setSelectedNodeId((current) =>
                current === view.node.id ? null : view.node.id,
              );
            }}
          />
        ))}

        {selectedNode ? (
          <div
            className="absolute z-[90]"
            style={{ left: `${selectedNode.x}%`, top: selectedNode.y }}
          >
            {selectedNode.node.type === "chest" ? (
              <RoadmapRewardPopover
                view={selectedNode}
                claiming={claimingNodeId === selectedNode.node.id}
                error={claimError}
                onClose={() => setSelectedNodeId(null)}
                onClaimReward={handleClaimReward}
              />
            ) : (
              <RoadmapNodePopover
                view={selectedNode}
                todayMinutes={todayMinutes}
                onClose={() => setSelectedNodeId(null)}
              />
            )}
          </div>
        ) : null}
      </div>

      <RewardClaimModal
        open={claimedRewardModal !== null}
        rewardLabel={claimedRewardModal?.rewardLabel ?? "+1 Streak Freeze"}
        onClose={() => setClaimedRewardModal(null)}
      />
      <RewardClaimToast
        message={claimedRewardToast}
        onDismiss={() => setClaimedRewardToast(null)}
      />
    </div>
  );
};
