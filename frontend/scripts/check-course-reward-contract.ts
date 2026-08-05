import assert from "node:assert/strict";
import { englishCourse } from "@/data/courses/english-course";
import { getCourseNodes } from "@/lib/courses/course-catalog";
import { validateCourseDefinition } from "@/lib/courses/course-validator";
import type { LearningNodeDefinition } from "@/types/course";
const expectedChestIds = [
    "chest-1",
    "en-s2-c1-chest-1",
    "en-s3-c1-chest-1",
];
const getNode = (nodeId: string) => {
    const node = getCourseNodes(englishCourse, "english").find((item) => item.id === nodeId);
    assert.ok(node, `Missing node ${nodeId}.`);
    return node;
};
const assertFreezeChest = (node: LearningNodeDefinition, unlockAfterId: string) => {
    assert.equal(node.type, "chest", `${node.id} must be a chest node.`);
    assert.equal(node.title, "Rương Freeze", `${node.id} title must be Rương Freeze.`);
    assert.equal(node.shortTitle, "Rương", `${node.id} short title must be Rương.`);
    assert.equal(node.unlockAfterId, unlockAfterId, `${node.id} unlock dependency is invalid.`);
    assert.equal(node.href, null, `${node.id} must not route to a lesson.`);
    assert.equal(node.xp, 0, `${node.id} must not grant XP in the reward contract.`);
    assert.equal(node.countsTowardProgress, false, `${node.id} must not count toward section progress.`);
    assert.equal(node.rewards?.length, 1, `${node.id} must define exactly one reward.`);
    assert.deepEqual(node.rewards?.[0], {
        type: "streak_freeze",
        amount: 1,
        label: "+1 Streak Freeze",
        description: "Freeze sẽ tự động bảo vệ chuỗi học khi bạn bỏ lỡ một ngày.",
        icon: "freeze",
    }, `${node.id} must grant exactly +1 Streak Freeze.`);
};
const validation = validateCourseDefinition(englishCourse);
assert.equal(validation.valid, true, `Course validation failed:\n${validation.errors.join("\n")}`);
const allNodes = getCourseNodes(englishCourse, "english");
const chestNodes = allNodes.filter((node) => node.type === "chest");
const progressNodes = allNodes.filter((node) => node.countsTowardProgress);
assert.equal(allNodes.length, 22, "English course must contain 22 nodes after adding Section 2-3 chests.");
assert.equal(progressNodes.length, 19, "Reward chests must not change the 19-node main progress total.");
assert.deepEqual(chestNodes.map((node) => node.id), expectedChestIds, "English course must contain one Freeze chest in each section.");
assertFreezeChest(getNode("chest-1"), "lesson-3");
assertFreezeChest(getNode("en-s2-c1-chest-1"), "en-s2-c1-lesson-3");
assertFreezeChest(getNode("en-s3-c1-chest-1"), "en-s3-c1-lesson-3");
for (const node of allNodes) {
    if (node.type !== "chest") {
        assert.equal(node.rewards, undefined, `Only chest nodes may define rewards: ${node.id}.`);
    }
}
assert.equal(getNode("lesson-4").unlockAfterId, "lesson-3", "Section 1 lesson 4 must not be blocked by the optional chest.");
assert.equal(getNode("en-s2-c1-lesson-4").unlockAfterId, "en-s2-c1-lesson-3", "Section 2 lesson 4 must not be blocked by the optional chest.");
assert.equal(getNode("en-s3-c1-lesson-4").unlockAfterId, "en-s3-c1-lesson-3", "Section 3 lesson 4 must not be blocked by the optional chest.");
console.log("Course reward contract check passed: 3 optional Freeze chests, +1 Freeze reward metadata, no progress inflation, and no lesson blocking.");
