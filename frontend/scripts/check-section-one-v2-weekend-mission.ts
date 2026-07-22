import assert from "node:assert/strict";
import { englishSectionOneExerciseCatalog } from "@/data/exercises/english/section-1";
import { checkExerciseAnswer } from "@/lib/exercises/check-exercise-answer";
import type { Exercise } from "@/types/exercise";

const getExercise = <Type extends Exercise["type"]>(lessonId: string, id: string, type: Type) => {
  const exercise = englishSectionOneExerciseCatalog[lessonId].find((item) => item.id === id);
  assert.ok(exercise);
  assert.equal(exercise.type, type);
  return exercise as Extract<Exercise, { type: Type }>;
};

const schedule = getExercise("lesson-5", "lesson-5-exercise-4", "multiple_choice");
assert.equal(schedule.options.find((option) => option.id === schedule.correctOptionId)?.text, "Sunday at 2:30 p.m.");
const scheduleText = schedule.context?.kind === "reading" ? schedule.context.text : "";
assert.match(scheduleText, /grandparents on Saturday/i);
assert.match(scheduleText, /football practice on Sunday morning/i);

const menuContext = englishSectionOneExerciseCatalog["lesson-3"].find(
  (exercise) => exercise.context?.kind === "reading",
)?.context;
const menuText = menuContext?.kind === "reading" ? menuContext.text : "";
for (const value of [/tea £2\.00/i, /coffee £2\.50/i, /cheese sandwich £4\.50/i, /chocolate cake £3\.00/i, /water £1\.50/i]) {
  assert.match(menuText, value);
}
const budget = getExercise("lesson-6", "lesson-6-exercise-5", "multiple_choice");
assert.equal(budget.options.find((option) => option.id === budget.correctOptionId)?.text, "Yes. They have £1.50 left");
assert.match(budget.explanation ?? "", /£13\.50/);

const route4Context = englishSectionOneExerciseCatalog["lesson-4"].find(
  (exercise) => exercise.context?.kind === "reading",
)?.context;
const route6Context = getExercise("lesson-6", "lesson-6-exercise-7", "listening_choice").context;
const route4 = route4Context?.kind === "reading" ? route4Context.text.toLowerCase() : "";
const route6 = route6Context?.kind === "listening" ? (route6Context.spokenText ?? "").toLowerCase() : "";
for (const step of ["go straight", "walk past the bank", "turn right at the supermarket"]) {
  assert.ok(route4.includes(step) && route6.includes(step));
}
assert.match(route4, /café.*library|library.*café/);
assert.match(route6, /library.*next to the café/);

const invitation = getExercise("lesson-5", "lesson-5-exercise-9", "short_writing");
const invitationResult = checkExerciseAnswer(invitation, {
  type: "short_writing",
  value: "Are you free on Saturday afternoon? Would you like to go shopping? How about meeting at the shopping centre at 4:30? Let’s meet there and have a drink after shopping.",
});
assert.equal(invitationResult.isCorrect, true);

const finalPlan = getExercise("lesson-6", "lesson-6-exercise-9", "short_writing");
const validPlan = checkExerciseAnswer(finalPlan, {
  type: "short_writing",
  value: "We are meeting outside the library on Saturday at 2:30. First, Emma will borrow a book. After that, we are going to the cafe for drinks and food. We need to leave before 6:30 so Daniel gets home before seven.",
});
assert.equal(validPlan.isCorrect, true);
const missingLeave = checkExerciseAnswer(finalPlan, {
  type: "short_writing",
  value: "We are meeting outside the library on Saturday at half past two. First, Emma will borrow an English book. After that, we are going to the Green Cup Café for drinks and a snack. Everyone is happy with the plan.",
});
assert.ok(missingLeave.scoreRatio > 0 && missingLeave.scoreRatio < 1);
assert.equal(missingLeave.feedbackCriteria?.find((criterion) => criterion.id === "content-leave-time")?.passed, false);
const wrongOrder = checkExerciseAnswer(finalPlan, {
  type: "short_writing",
  value: "After that, we are going to the Green Cup Café on Saturday. First, Emma will borrow an English book after meeting outside the library at 2:30. We need to leave before 6:30 so Daniel gets home on time.",
});
assert.ok(wrongOrder.scoreRatio > 0 && wrongOrder.scoreRatio < 1);
assert.equal(wrongOrder.feedbackCriteria?.find((criterion) => criterion.id === "phrase-order")?.passed, false);

for (const exercise of [...englishSectionOneExerciseCatalog["lesson-5"], ...englishSectionOneExerciseCatalog["lesson-6"]]) {
  if (!exercise.hint) continue;
  const answer = exercise.type === "multiple_choice" || exercise.type === "dialogue_choice" || exercise.type === "listening_choice"
    ? exercise.options.find((option) => option.id === exercise.correctOptionId)?.text
    : exercise.type === "fill_blank" ? exercise.acceptedAnswers[0] : "";
  if (answer && answer.length >= 6) assert.ok(!exercise.hint.toLowerCase().includes(answer.toLowerCase()));
}

console.log(
  "Section 1 V2 weekend mission check passed: schedules have one clear answer, café prices and totals remain consistent, directions reuse one route, and flexible writing receives criterion-level partial credit without answer-leaking hints.",
);
