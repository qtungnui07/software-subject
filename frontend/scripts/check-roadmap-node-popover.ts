import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { englishCourse } from "@/data/courses/english-course";
const root = process.cwd();
const resolve = (path: string) => join(root, path);
const read = (path: string) => readFileSync(resolve(path), "utf8");
const requiredFiles = [
    "components/learn/course-roadmap.tsx",
    "components/learn/roadmap-node.tsx",
    "components/learn/roadmap-node-popover.tsx",
    "components/learn/roadmap-reward-popover.tsx",
    "components/lesson/course-lesson-detail.tsx",
    "lib/courses/lesson-detail-view-model.ts",
    "app/(main)/lesson/[lessonId]/page.tsx",
    "app/globals.css",
] as const;
for (const path of requiredFiles) {
    assert.equal(existsSync(resolve(path)), true, `Missing Phase 2 file: ${path}`);
}
const roadmapSource = read("components/learn/course-roadmap.tsx");
const nodeSource = read("components/learn/roadmap-node.tsx");
const learningPopoverSource = read("components/learn/roadmap-node-popover.tsx");
const rewardPopoverSource = read("components/learn/roadmap-reward-popover.tsx");
const detailPageSource = read("app/(main)/lesson/[lessonId]/page.tsx");
const sharedDetailSource = read("components/lesson/course-lesson-detail.tsx");
const detailViewModelSource = read("lib/courses/lesson-detail-view-model.ts");
const cssSource = read("app/globals.css");
const packageSource = read("package.json");
assert(nodeSource.includes("<button") &&
    nodeSource.includes("onSelect();") &&
    !nodeSource.includes("<Link"), "Roadmap nodes must only toggle UI state and must not navigate directly.");
assert(nodeSource.includes("aria-expanded={selected}") &&
    nodeSource.includes("aria-disabled={view.disabled}") &&
    nodeSource.includes("aria-controls="), "Roadmap nodes must expose selected, locked, and popover relationships to assistive technology.");
assert(roadmapSource.includes("return `/lesson/${encodeURIComponent(node.id)}`") &&
    roadmapSource.includes("href: getDetailHref(node)") &&
    !roadmapSource.includes("href: node.href"), "Learning and checkpoint CTAs must route through /lesson/[lessonId] instead of the player query route.");
assert(!learningPopoverSource.includes("/lesson?id=") &&
    learningPopoverSource.includes("href={view.href}"), "The learning popover must use the normalized detail href and never link directly to the player.");
assert(detailPageSource.includes("getLearningNodeById") &&
    detailPageSource.includes("buildLessonDetailViewModel") &&
    detailPageSource.includes("<CourseLessonDetail") &&
    detailViewModelSource.includes("/lesson?id=${encodeURIComponent(node.id)}"), "The detail route must resolve every learning node and keep the player behind a separate start action.");
assert(detailViewModelSource.includes("getCourseNodeAccess") &&
    sharedDetailSource.includes("detail.playerHref") &&
    detailViewModelSource.includes("Chưa mở khóa"), "The shared detail page must preserve server-owned node access after the Phase 2 bridge is removed.");
for (const label of [
    "Xem bài học",
    "Tiếp tục",
    "Ôn tập",
    "Xem checkpoint",
    "Xem kết quả",
    "Chưa mở khóa",
]) {
    assert(roadmapSource.includes(`return \"${label}\"`), `Missing Phase 2 action label: ${label}`);
}
assert(roadmapSource.includes("getLockedReason") &&
    roadmapSource.includes("prerequisite?.title") &&
    learningPopoverSource.includes("view.lockedReason"), "Locked learning nodes must explain the exact prerequisite in their popover.");
assert(learningPopoverSource.includes("view.estimatedMinutes") &&
    learningPopoverSource.includes("view.node.xp") &&
    learningPopoverSource.includes('data-course-roadmap-popover-kind="learning"'), "Learning popovers must stay concise while showing status, XP, and estimated time.");
assert(roadmapSource.includes('event.key === "Escape"') &&
    roadmapSource.includes('document.addEventListener("pointerdown"') &&
    roadmapSource.includes("current === view.node.id ? null : view.node.id"), "Popover state must close with Escape/outside clicks and toggle when the same node is selected again.");
assert(roadmapSource.includes('selectedNode.node.type === "chest"') &&
    roadmapSource.includes("<RoadmapRewardPopover") &&
    roadmapSource.includes("<RoadmapNodePopover"), "Reward and learning nodes must use separate popover contracts.");
assert(rewardPopoverSource.includes('data-course-roadmap-reward-popover="freeze"') &&
    rewardPopoverSource.includes("onClaimReward?.(view.node.id)") &&
    !rewardPopoverSource.includes("<Link"), "Freeze chests must remain claimable on the roadmap and never navigate to lesson detail.");
assert(cssSource.includes(".course-roadmap-popover--up") &&
    cssSource.includes("bottom: calc(100% + 34px)") &&
    cssSource.includes("width: min(286px, calc(100vw - 32px))"), "Mobile popovers must remain inside the viewport and open upward for lower roadmap nodes.");
for (const section of englishCourse.sections) {
    for (const node of section.chapter.nodes) {
        if (node.type === "chest") {
            assert.equal(node.href, null, `${node.id} must stay on the roadmap.`);
            continue;
        }
        assert(node.id.length > 0, `${section.id} contains an invalid node id.`);
    }
}
assert(packageSource.includes('"check:roadmap-node-popover": "tsx scripts/check-roadmap-node-popover.ts"'), "package.json must expose check:roadmap-node-popover.");
console.log("Roadmap node popover check passed: nodes toggle one responsive popover, locked prerequisites are explained, lesson/checkpoint CTAs route to detail pages, and Freeze chests stay on the roadmap.");
