import assert from "node:assert/strict";
import { englishCourse } from "@/data/courses/english-course";
import { dedicatedExerciseCatalog } from "@/lib/exercises/exercise-catalog";
import { validateExerciseCatalog } from "@/lib/exercises/exercise-validator";
import type { ExerciseType } from "@/types/exercise";
const CORE_TYPES = new Set<ExerciseType>([
    "multiple_choice",
    "arrange_words",
    "fill_blank",
    "dialogue_choice",
    "listening_choice",
]);
const SECTION_ONE_TYPES = new Set<ExerciseType>([
    ...CORE_TYPES,
    "match_pairs",
    "arrange_dialogue",
    "sentence_rewrite",
    "short_writing",
]);
const EXPECTED_SKILLS = new Set([
    "vocabulary",
    "grammar",
    "listening",
    "reading",
    "conversation",
]);
const EXPECTED_TOTAL = 132;
const issues = validateExerciseCatalog(dedicatedExerciseCatalog);
assert.deepEqual(issues, [], issues.map((issue) => `${issue.exerciseId}: ${issue.message}`).join("\n"));
let totalExercises = 0;
for (const section of englishCourse.sections) {
    assert.equal(section.contentStatus, "ready", `${section.id} must be ready.`);
    const playableNodes = section.chapter.nodes.filter((node) => node.type !== "chest");
    const sectionTypes = new Set<ExerciseType>();
    const sectionSkills = new Set<string>();
    for (const node of playableNodes) {
        assert.equal(node.contentStatus, "ready", `${node.id} must be ready.`);
        assert.ok(node.href, `${node.id} must have a playable route.`);
        const exercises = dedicatedExerciseCatalog[node.id];
        assert.ok(exercises, `${node.id} is missing content.`);
        const expectedCount = node.type === "checkpoint"
            ? node.id === "chapter-1-test"
                ? 12
                : 8
            : ["lesson-1", "lesson-2", "lesson-3", "lesson-4", "lesson-5", "lesson-6"].includes(node.id)
                ? 9
                : 5;
        assert.equal(exercises.length, expectedCount, `${node.id} must contain ${expectedCount} exercises.`);
        for (const exercise of exercises) {
            sectionTypes.add(exercise.type);
            sectionSkills.add(exercise.skill);
            assert.ok(exercise.explanation?.trim(), `${exercise.id} needs an explanation.`);
            if (exercise.contentVersion === 2) {
                assert.ok(exercise.difficulty === 1 ||
                    exercise.difficulty === 2 ||
                    (node.type === "checkpoint" && exercise.difficulty === 3), `${exercise.id} V2 difficulty must stay within the lesson/checkpoint range.`);
            }
            else {
                assert.equal(exercise.difficulty, section.order, `${exercise.id} difficulty must match Section ${section.order}.`);
            }
            assert.equal(/placeholder|todo|phase 3/i.test(`${exercise.instruction} ${exercise.prompt} ${exercise.explanation ?? ""}`), false, `${exercise.id} still contains temporary content.`);
        }
        totalExercises += exercises.length;
    }
    assert.deepEqual(sectionTypes, section.order === 1 ? SECTION_ONE_TYPES : CORE_TYPES, section.order === 1
        ? `${section.id} must use all nine Section 1 exercise types.`
        : `${section.id} must use all five core exercise types.`);
    assert.deepEqual(sectionSkills, EXPECTED_SKILLS, `${section.id} must cover all five learning skills.`);
}
const playableIds = new Set(englishCourse.sections.flatMap((section) => section.chapter.nodes
    .filter((node) => node.type !== "chest")
    .map((node) => node.id)));
assert.deepEqual(new Set(Object.keys(dedicatedExerciseCatalog)), playableIds, "Exercise catalog keys must exactly match playable course nodes.");
assert.equal(totalExercises, EXPECTED_TOTAL, `English Content Pack must contain ${EXPECTED_TOTAL} exercises.`);
console.log("English course content check passed: 132 exercises, 19 dedicated lesson sets, Section 1 uses all 9 exercise types, Sections 2-3 retain the 5 core types, and all sections cover every learning skill.");
