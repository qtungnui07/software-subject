import { recordQuestLessonProgress } from "@/services/quest-service";
import {
  getQuestProgressSkipCode,
  normalizeQuestAccuracy,
  normalizeQuestDurationSeconds,
  shouldRecordQuestProgress,
} from "@/services/quest-progress-policy";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const checkPolicy = () => {
  assert(
    shouldRecordQuestProgress({ isPassed: true, alreadyClaimed: false, earnedXp: 18 }) === true,
    "Passed, newly claimed XP should record quest progress.",
  );
  assert(
    shouldRecordQuestProgress({ isPassed: true, alreadyClaimed: true, earnedXp: 18 }) === false,
    "Already claimed lesson XP must not record quest progress again.",
  );
  assert(
    shouldRecordQuestProgress({ isPassed: false, alreadyClaimed: false, earnedXp: 18 }) === false,
    "Failed lesson must not record quest progress.",
  );
  assert(
    shouldRecordQuestProgress({ isPassed: true, alreadyClaimed: false, earnedXp: 0 }) === false,
    "Zero XP completion must not record quest progress.",
  );
  assert(
    getQuestProgressSkipCode({ isPassed: false, alreadyClaimed: false, earnedXp: 18 }) ===
      "LESSON_NOT_PASSED",
    "Failed lesson skip code should be LESSON_NOT_PASSED.",
  );
  assert(
    getQuestProgressSkipCode({ isPassed: true, alreadyClaimed: true, earnedXp: 18 }) ===
      "LESSON_XP_ALREADY_CLAIMED",
    "Duplicate lesson skip code should be LESSON_XP_ALREADY_CLAIMED.",
  );
  assert(
    getQuestProgressSkipCode({ isPassed: true, alreadyClaimed: false, earnedXp: 0 }) ===
      "LESSON_XP_NOT_EARNED",
    "Zero XP skip code should be LESSON_XP_NOT_EARNED.",
  );
  assert(normalizeQuestAccuracy(128) === 100, "Accuracy should be capped at 100.");
  assert(normalizeQuestAccuracy(-5) === 0, "Negative accuracy should normalize to 0.");
  assert(normalizeQuestDurationSeconds("605") === 605, "Duration strings should parse safely.");
  assert(normalizeQuestDurationSeconds(-10) === 0, "Negative duration should normalize to 0.");
};

const checkNoDbWrite = async () => {
  const result = await recordQuestLessonProgress({
    userId: "local-quest-progress-check",
    earnedXp: 18,
    accuracy: 86,
    durationSeconds: 600,
  });

  assert(result.success === true, "recordQuestLessonProgress should return success true.");

  if (!process.env.DATABASE_URL) {
    assert(result.skipped === true, "recordQuestLessonProgress should skip without DATABASE_URL.");
    assert(
      result.code === "QUEST_DATABASE_UNAVAILABLE",
      `Expected QUEST_DATABASE_UNAVAILABLE without DB, got ${result.code}`,
    );
  }
};

const main = async () => {
  checkPolicy();
  await checkNoDbWrite();

  console.log(
    "Quest progress contract check passed: policy blocks duplicates/failures and no DB skips safely.",
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
