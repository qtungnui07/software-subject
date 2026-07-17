import assert from "node:assert/strict";

import {
  formatQuestCountdown,
  getNextQuestResetAt,
  getQuestResetCountdown,
  QUEST_COUNTDOWN_PLACEHOLDER,
} from "../lib/quests/quest-time";

const vietnamAfternoon = new Date("2026-07-05T10:00:00.000Z");
assert.equal(
  getNextQuestResetAt(vietnamAfternoon),
  "2026-07-05T17:00:00.000Z",
  "The next reset must be midnight in Asia/Ho_Chi_Minh.",
);

const beforeVietnamMidnight = new Date("2026-07-05T16:59:59.000Z");
assert.equal(
  getNextQuestResetAt(beforeVietnamMidnight),
  "2026-07-05T17:00:00.000Z",
  "The reset target must remain the same until Vietnam midnight.",
);

const afterVietnamMidnight = new Date("2026-07-05T17:00:01.000Z");
assert.equal(
  getNextQuestResetAt(afterVietnamMidnight),
  "2026-07-06T17:00:00.000Z",
  "After Vietnam midnight, the target must move to the following day.",
);

assert.equal(formatQuestCountdown(3_723_000), "01:02:03");
assert.equal(formatQuestCountdown(0), "00:00:00");

const activeCountdown = getQuestResetCountdown(
  "2026-07-05T17:00:00.000Z",
  Date.parse("2026-07-05T15:57:57.000Z"),
);
assert.deepEqual(activeCountdown, {
  label: "01:02:03",
  remainingMs: 3_723_000,
  isExpired: false,
  isValid: true,
});

const expiredCountdown = getQuestResetCountdown(
  "2026-07-05T17:00:00.000Z",
  Date.parse("2026-07-05T17:00:00.000Z"),
);
assert.equal(expiredCountdown.label, "00:00:00");
assert.equal(expiredCountdown.isExpired, true);
assert.equal(expiredCountdown.isValid, true);

const invalidCountdown = getQuestResetCountdown("not-a-date", 0);
assert.equal(invalidCountdown.label, QUEST_COUNTDOWN_PLACEHOLDER);
assert.equal(invalidCountdown.remainingMs, null);
assert.equal(invalidCountdown.isExpired, false);
assert.equal(invalidCountdown.isValid, false);

console.log(
  "Quest reset countdown check passed: timezone, formatting, expiry, and invalid fallback are valid.",
);
