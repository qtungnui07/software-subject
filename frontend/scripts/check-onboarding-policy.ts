import assert from "node:assert/strict";

import {
  completeBasicOnboarding,
  completePlacementOnboarding,
  createPendingOnboardingState,
  migrateLegacyOnboardingState,
  startPlacementOnboarding,
} from "@/lib/onboarding/onboarding-policy";

const pending = createPendingOnboardingState();
assert.equal(pending.status, "pending");
assert.equal(pending.choice, null);

const placement = startPlacementOnboarding(pending);
assert.equal(placement.status, "placement_in_progress");
assert.equal(placement.choice, "placement");
assert.equal(placement.completedAt, null);

const completedPlacement = completePlacementOnboarding(
  placement,
  "2026-07-09T00:00:00.000Z",
);
assert.equal(completedPlacement.status, "completed");
assert.equal(completedPlacement.choice, "placement");
assert.equal(completedPlacement.completedAt, "2026-07-09T00:00:00.000Z");

const completedBasic = completeBasicOnboarding(
  pending,
  "2026-07-09T01:00:00.000Z",
);
assert.equal(completedBasic.status, "completed");
assert.equal(completedBasic.choice, "basic");

const migrated = migrateLegacyOnboardingState(
  pending,
  true,
  "2026-07-09T02:00:00.000Z",
);
assert.equal(migrated.status, "completed");
assert.equal(migrated.choice, null);

const untouchedNewUser = migrateLegacyOnboardingState(pending, false);
assert.equal(untouchedNewUser.status, "pending");

const completedNeverRegresses = migrateLegacyOnboardingState(
  completedPlacement,
  false,
);
assert.equal(completedNeverRegresses.status, "completed");
assert.equal(completedNeverRegresses.choice, "placement");

console.log(
  "Onboarding policy check passed: basic and placement flows complete safely, legacy learners migrate, and completed users never regress.",
);
