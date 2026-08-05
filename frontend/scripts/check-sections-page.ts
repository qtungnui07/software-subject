import assert from "node:assert/strict";
import fs, { existsSync } from "node:fs";
import path from "node:path";
import { englishCourse } from "@/data/courses/english-course";
import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import { buildSectionsPageViewModels } from "@/lib/courses/sections-page-view-model";
const root = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(root, filePath), "utf8");
const defaultProgress = createDefaultCourseProgress(englishCourse);
const defaultSections = buildSectionsPageViewModels(defaultProgress, null);
assert.equal(defaultSections.length, 3, "The sections page must show all three English sections.");
assert.deepEqual(defaultSections.map((section) => section.order), [1, 2, 3], "Sections must remain in their learning order.");
assert.equal(defaultSections[0]?.current, true, "Section 1 must be current for a new learner.");
assert.equal(defaultSections[0]?.unlocked, true, "Section 1 must be unlocked for a new learner.");
assert.equal(defaultSections[1]?.status, "locked", "Section 2 must remain locked initially.");
assert.match(defaultSections[1]?.lockReason ?? "", /Checkpoint|Kiểm tra/i, "Locked cards must explain the real checkpoint prerequisite.");
for (const [index, section] of englishCourse.sections.entries()) {
    const expectedRequiredNodes = section.chapter.nodes.filter((node) => node.countsTowardProgress).length;
    assert.equal(defaultSections[index]?.totalLessons, expectedRequiredNodes, "Reward chests must not count toward section progress.");
}
const sectionOneRequiredIds = englishCourse.sections[0].chapter.nodes
    .filter((node) => node.countsTowardProgress)
    .map((node) => node.id);
const progressed = {
    ...defaultProgress,
    currentSectionId: "english-section-2",
    unlockedSectionIds: ["english-section-1", "english-section-2"],
    completedNodeIds: sectionOneRequiredIds,
};
const progressedSections = buildSectionsPageViewModels(progressed, "english-section-2");
assert.equal(progressedSections[0]?.completed, true, "Completed sections must be available for review.");
assert.equal(progressedSections[0]?.actionLabel, "ÔN TẬP");
assert.equal(progressedSections[1]?.current, true);
assert.equal(progressedSections[1]?.recommended, true, "Placement recommendations must use real placement data.");
assert.equal(progressedSections[1]?.actionLabel, "TIẾP TỤC");
const pageSource = read("app/(main)/sections/page.tsx");
const clientSource = read("app/(main)/sections/sections-client.tsx");
const cardSource = read("components/sections/section-card.tsx");
const apiSource = read("app/api/progress/course/select-section/route.ts");
assert.match(pageSource, /buildSectionsPageViewModels/);
assert.match(pageSource, /getUserProgress/);
assert.match(pageSource, /redirect\("\/courses"\)/);
assert.match(pageSource, /highestAssignedSectionId/);
assert.match(clientSource, /\/api\/progress\/course\/select-section/);
assert.match(clientSource, /router\.push\("\/learn"\)/);
assert.match(clientSource, /section\.current/);
assert.match(clientSource, /toast\.success/);
assert.match(cardSource, /disabled=\{!section\.unlocked \|\| disabled\}/);
assert.match(apiSource, /SECTION_LOCKED/);
assert.match(apiSource, /selectCurrentSectionForUser/);
assert.equal(existsSync(path.join(root, "components/learn/section-switcher.tsx")), false, "The legacy switcher must stay removed after /sections becomes the only section picker.");
assert.match(pageSource, /requestedSectionId=/);
assert.match(clientSource, /scrollIntoView/);
assert.match(cardSource, /highlighted &&/);
console.log("Sections page check passed: all three sections render in order, required-node progress excludes reward chests, locked sections explain prerequisites, requested cards highlight safely, and server selection returns learners to /learn.");
