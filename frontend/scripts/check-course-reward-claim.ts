import { englishCourse } from "@/data/courses/english-course";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { claimCourseReward } from "@/lib/courses/course-reward-claim";
import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import { applyPlacementUnlock, completeCourseNode, } from "@/lib/courses/course-unlock-policy";
const completeNodes = (nodeIds: string[], sectionId?: string) => {
    let progress = createDefaultCourseProgress(englishCourse);
    if (sectionId) {
        progress = applyPlacementUnlock(progress, sectionId, englishCourse);
    }
    for (const nodeId of nodeIds) {
        const result = completeCourseNode(progress, nodeId, englishCourse);
        assert.equal(result.reason, "updated", `${nodeId} must be completable for reward setup.`);
        progress = result.progress;
    }
    return progress;
};
const claimAndAssert = ({ setupNodes, chestId, sectionId, }: {
    setupNodes: string[];
    chestId: string;
    sectionId?: string;
}) => {
    const setupProgress = completeNodes(setupNodes, sectionId);
    const first = claimCourseReward(setupProgress, chestId, englishCourse);
    assert.equal(first.reason, "updated");
    assert.equal(first.changed, true);
    assert.equal(first.alreadyClaimed, false);
    assert.equal(first.nodeId, chestId);
    assert.equal(first.reward?.type, "streak_freeze");
    assert.equal(first.reward?.amount, 1);
    assert.equal(first.progress.claimedRewardNodeIds.includes(chestId), true);
    assert.deepEqual(first.progress.completedNodeIds, setupProgress.completedNodeIds, "Claiming a reward chest must not mutate completed lesson progress.");
    const second = claimCourseReward(first.progress, chestId, englishCourse);
    assert.equal(second.reason, "already-claimed");
    assert.equal(second.changed, false);
    assert.equal(second.alreadyClaimed, true);
    assert.equal(second.reward?.amount, 1);
    assert.deepEqual(second.progress.claimedRewardNodeIds, first.progress.claimedRewardNodeIds, "Claiming the same chest twice must keep claimed ids stable.");
};
claimAndAssert({
    setupNodes: ["lesson-1", "lesson-2", "lesson-3"],
    chestId: "chest-1",
});
claimAndAssert({
    sectionId: "english-section-2",
    setupNodes: [
        "en-s2-c1-lesson-1",
        "en-s2-c1-lesson-2",
        "en-s2-c1-lesson-3",
    ],
    chestId: "en-s2-c1-chest-1",
});
claimAndAssert({
    sectionId: "english-section-3",
    setupNodes: [
        "en-s3-c1-lesson-1",
        "en-s3-c1-lesson-2",
        "en-s3-c1-lesson-3",
    ],
    chestId: "en-s3-c1-chest-1",
});
const lockedChest = claimCourseReward(createDefaultCourseProgress(englishCourse), "chest-1", englishCourse);
assert.equal(lockedChest.reason, "locked-node");
assert.equal(lockedChest.changed, false);
assert.equal(lockedChest.reward, undefined);
const nonChest = claimCourseReward(createDefaultCourseProgress(englishCourse), "lesson-1", englishCourse);
assert.equal(nonChest.reason, "not-chest");
assert.equal(nonChest.changed, false);
const missingNode = claimCourseReward(createDefaultCourseProgress(englishCourse), "missing-node", englishCourse);
assert.equal(missingNode.reason, "invalid-node");
assert.equal(missingNode.changed, false);
const serviceSource = readFileSync(resolve(process.cwd(), "services/course-reward-service.ts"), "utf8");
assert.equal(serviceSource.includes("reward.amount"), true, "Reward service must use the server-side contract amount.");
assert.equal(serviceSource.includes("streakFreezes"), true, "Reward service must update or return streakFreezes.");
assert.equal(serviceSource.includes("already-claimed"), true, "Reward service must expose idempotent already-claimed handling.");
const routeSource = readFileSync(resolve(process.cwd(), "app/api/progress/course/claim-reward/route.ts"), "utf8");
for (const forbiddenField of ["reward", "amount", "streakFreezes", "claimedRewardNodeIds"]) {
    assert.equal(routeSource.includes(`"${forbiddenField}"`), true, `Claim route must reject client-provided ${forbiddenField}.`);
}
assert.equal(routeSource.includes("claimCourseRewardForUser"), true, "Claim route must delegate to the reward service.");
console.log("Course reward claim check passed: Section 1-3 Freeze chests claim once, locked/non-chest/unknown nodes are blocked, and the API uses server-owned reward data.");
