import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  bonusQuestDefinitions,
  dailyQuestDefinitions,
} from "@/constants/quests";
import { englishCourse } from "@/data/courses/english-course";
import { englishLessonDetailCatalog } from "@/data/courses/english-lesson-details";
import { englishExerciseCatalog } from "@/data/exercises/english";
import { englishPlacementQuestions } from "@/data/placement-tests/english-placement-test";
import { sectionOneCheckpointAssessments } from "@/data/exercises/english/section-1/checkpoint";
import { ENGLISH_PLACEMENT_TEST_VERSION } from "@/types/placement-test";

const outputPath = path.resolve(
  process.cwd(),
  "..",
  "backend",
  "data",
  "content-v1.json",
);

const dataset = {
  release: {
    id: "robogo-content-v1",
    version: 1,
    status: "published",
  },
  courses: [englishCourse],
  lessonDetails: englishLessonDetailCatalog,
  exerciseCatalog: englishExerciseCatalog,
  checkpointConfigs: Object.fromEntries(
    englishCourse.sections
      .flatMap((section) =>
        section.chapter.nodes
          .filter((node) => node.type === "checkpoint")
          .map((node) => {
            const exercises = englishExerciseCatalog[node.id] ?? [];
            const assessments =
              node.id === "chapter-1-test"
                ? sectionOneCheckpointAssessments
                : exercises.map((exercise) => ({
                    exerciseId: exercise.id,
                    weight: 1,
                    category: exercise.skill,
                    skillTags: [],
                    recommendedLessonIds: section.chapter.nodes
                      .filter(
                        (candidate) =>
                          candidate.type === "lesson" &&
                          candidate.order < node.order,
                      )
                      .slice(-1)
                      .map((candidate) => candidate.id),
                  }));

            return [
              node.id,
              {
                passThreshold: 70,
                assessments,
              },
            ];
          }),
      ),
  ),
  placementTests: [
    {
      id: ENGLISH_PLACEMENT_TEST_VERSION,
      courseId: "english",
      version: ENGLISH_PLACEMENT_TEST_VERSION,
      questions: englishPlacementQuestions,
    },
  ],
  questDefinitions: [...dailyQuestDefinitions, ...bonusQuestDefinitions],
};

const exerciseCount = Object.values(englishExerciseCatalog).reduce(
  (total, exercises) => total + exercises.length,
  0,
);

const main = async () => {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
  console.log(
    `Exported ${dataset.courses.length} course, ${exerciseCount} exercises, ` +
      `${englishPlacementQuestions.length} placement questions and ` +
      `${dataset.questDefinitions.length} quest definitions to ${outputPath}`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
