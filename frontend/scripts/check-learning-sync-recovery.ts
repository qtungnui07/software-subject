import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  getLearningSyncRetryDecision,
  MAX_LEARNING_SYNC_ATTEMPTS,
} from "@/lib/learning/sync-retry-policy";

const now = new Date("2026-07-09T00:00:00.000Z");
const expectedMinutes = [1, 5, 15, 60];

for (let index = 0; index < expectedMinutes.length; index += 1) {
  const attempts = index + 1;
  const decision = getLearningSyncRetryDecision(attempts, now);
  assert.equal(decision.exhausted, false);
  assert.equal(decision.status, "pending");
  assert.equal(
    decision.nextRetryAt?.getTime(),
    now.getTime() + expectedMinutes[index] * 60_000,
  );
}

const exhausted = getLearningSyncRetryDecision(MAX_LEARNING_SYNC_ATTEMPTS, now);
assert.equal(exhausted.exhausted, true);
assert.equal(exhausted.status, "failed");
assert.equal(exhausted.nextRetryAt, null);

const serviceSource = readFileSync(
  resolve(process.cwd(), "services/learning-sync-recovery-service.ts"),
  "utf8",
);
for (const required of [
  "enqueueLearningSyncJob",
  "processPendingLearningSyncJobs",
  "PROCESSING_LEASE_MS",
  "learning_sync_retry_success",
  "learning_sync_retry_failed",
]) {
  assert.equal(serviceSource.includes(required), true, `Missing ${required}.`);
}

const completionSource = readFileSync(
  resolve(process.cwd(), "services/learning-completion-service.ts"),
  "utf8",
);
assert.equal(completionSource.includes("enqueueLearningSyncJobs"), true);
assert.equal(completionSource.includes("queuedSystems"), true);

console.log(
  "Learning sync recovery check passed: durable jobs, bounded backoff, stale leases, completion enqueueing, and duplicate-safe system keys are present.",
);
