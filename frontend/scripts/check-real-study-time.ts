import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  formatStudyDuration,
  getWholeStudyMinutes,
} from "@/lib/study-time/study-time-format";
import {
  canAcquireStudySessionLease,
  createStudySessionLease,
  isStudySessionLeaseStale,
  parseStudySessionLease,
  STUDY_SESSION_HEARTBEAT_MS,
  STUDY_SESSION_LEASE_MS,
  STUDY_SESSION_LOCK_KEY,
} from "@/lib/study-time/study-session-lock";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

assert.equal(formatStudyDuration(0), "0 phút");
assert.equal(formatStudyDuration(59), "0 phút");
assert.equal(formatStudyDuration(60), "1 phút");
assert.equal(formatStudyDuration(119), "1 phút");
assert.equal(formatStudyDuration(120), "2 phút");
assert.equal(formatStudyDuration(420), "7 phút");
assert.equal(formatStudyDuration(3_720), "1 giờ 2 phút");
assert.equal(getWholeStudyMinutes(-10), 0);

const now = 1_000_000;
const ownLease = createStudySessionLease("tab-a", now);
assert.deepEqual(
  parseStudySessionLease(JSON.stringify(ownLease)),
  ownLease,
  "A valid study-session lease must round-trip through localStorage JSON.",
);
assert.equal(parseStudySessionLease("invalid"), null);
assert.equal(isStudySessionLeaseStale(ownLease, now + 1_000), false);
assert.equal(
  isStudySessionLeaseStale(ownLease, now + STUDY_SESSION_LEASE_MS),
  true,
);
assert.equal(canAcquireStudySessionLease(ownLease, "tab-a", now), true);
assert.equal(canAcquireStudySessionLease(ownLease, "tab-b", now), false);
assert.equal(
  canAcquireStudySessionLease(
    ownLease,
    "tab-b",
    now + STUDY_SESSION_LEASE_MS,
  ),
  true,
);
assert.equal(STUDY_SESSION_LOCK_KEY, "robogo:active-study-session");
assert(STUDY_SESSION_HEARTBEAT_MS < STUDY_SESSION_LEASE_MS);

const progressOverviewSource = read(
  "components/progress/progress-overview.tsx",
);
const learnClientSource = read("components/learn/course-learn-client.tsx");
const legacyLearnClientSource = read("components/chapter-one-learn-client.tsx");
const studyTimeCardSource = read("components/study-time-card.tsx");
const studyTimeHookSource = read("components/use-study-time-summary.ts");
const lessonTimerSource = read("components/lesson-study-timer.tsx");
const lessonPlayerSource = read("app/lesson/page.tsx");
const studyTimeRouteSource = read("app/api/study-time/route.ts");
const studyTimeServiceSource = read("services/study-time-service.ts");
const sessionPolicySource = read("lib/study-session-policy.ts");
const backendSource = read("../backend/src/server.js");

assert(
  progressOverviewSource.includes("totalStudySeconds: number") &&
    progressOverviewSource.includes(
      "formatStudyDuration(totalStudySeconds)",
    ) &&
    !progressOverviewSource.includes("completedMinutes"),
  "ProgressOverview must display cumulative real study seconds instead of estimated lesson minutes.",
);
assert(
  learnClientSource.includes("totalStudySeconds={totalStudySeconds}") &&
    learnClientSource.includes("onSummaryChange={setStudyTimeSummary}"),
  "The active learn page must pass the server-backed cumulative summary into ProgressOverview.",
);
assert(
  legacyLearnClientSource.includes("totalStudySeconds={totalStudySeconds}") &&
    legacyLearnClientSource.includes("onSummaryChange={setStudyTimeSummary}"),
  "The legacy learn client must keep the same real-time contract while it remains in the repository.",
);
assert(
  studyTimeCardSource.includes("formatStudyDuration(summary.totalSeconds)") &&
    studyTimeCardSource.includes("onSummaryChange"),
  "StudyTimeCard must format and publish the complete daily/cumulative summary.",
);
assert.match(
  studyTimeHookSource,
  /todaySeconds:\s*number;[\s\S]*totalSeconds:\s*number;/,
  "The browser study-time event must carry both todaySeconds and totalSeconds.",
);
assert(
  lessonTimerSource.includes("const SYNC_EVERY_SECONDS = 15") &&
    lessonTimerSource.includes("totalSeconds: Number(data.summary.totalSeconds") &&
    lessonTimerSource.includes('document.visibilityState === "visible"') &&
    lessonTimerSource.includes("document.hasFocus()") &&
    lessonTimerSource.includes("STUDY_SESSION_LOCK_KEY") &&
    lessonTimerSource.includes("STUDY_SESSION_HEARTBEAT_MS"),
  "LessonStudyTimer must sync every 15 seconds, publish cumulative totals, pause outside the focused visible tab, and use a cross-tab lease.",
);
assert(
  lessonPlayerSource.includes("!isExitModalOpen") &&
    lessonPlayerSource.includes("!isFinished"),
  "Lesson time must stop for exit/result states instead of counting outside active exercises.",
);
assert(
  sessionPolicySource.includes("AFK_INACTIVITY_LIMIT_MS = 60_000") &&
    sessionPolicySource.includes("getAfkInactivityLimitMs"),
  "AFK detection must use the agreed 60-second inactivity threshold.",
);
assert.match(
  studyTimeServiceSource,
  /totalSeconds:\s*number;[\s\S]*todaySeconds:\s*number;/,
);
assert(
  studyTimeRouteSource.includes("getStudyTime") &&
    studyTimeRouteSource.includes("trackStudyTime") &&
    studyTimeRouteSource.includes("durationSeconds <= 0"),
  "The authenticated study-time API must preserve read, append, and validation behavior.",
);
assert(
  backendSource.includes('const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh"') &&
    backendSource.includes(
      "total_seconds = study_time_summary.total_seconds + ${durationSeconds}",
    ) &&
    backendSource.includes(
      "then study_time_summary.today_seconds + ${durationSeconds}",
    ),
  "The backend must keep cumulative totals and reset only today's seconds using Vietnam time.",
);

console.log(
  "Real study-time check passed: cumulative totals use server seconds, display floors partial minutes, AFK pauses after 60 seconds, hidden/unfocused tabs stop counting, and only one tab owns the study lease.",
);
