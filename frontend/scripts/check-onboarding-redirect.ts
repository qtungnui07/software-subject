import assert from "node:assert/strict";

import {
  getDefaultPostAuthDestination,
  getLearnGateRedirect,
  getOnboardingPageRedirect,
  sanitizeInternalRedirect,
} from "@/lib/onboarding/onboarding-redirect";

assert.equal(sanitizeInternalRedirect("/placement-test"), "/placement-test");
assert.equal(sanitizeInternalRedirect("//evil.example"), null);
assert.equal(sanitizeInternalRedirect("https://evil.example"), null);
assert.equal(sanitizeInternalRedirect(null), null);

assert.equal(getDefaultPostAuthDestination(null), "/onboarding");
assert.equal(getDefaultPostAuthDestination("/learn"), "/onboarding");
assert.equal(
  getDefaultPostAuthDestination("/learn?section=english-section-2"),
  "/onboarding",
);
assert.equal(
  getDefaultPostAuthDestination("/placement-test"),
  "/placement-test",
);
assert.equal(
  getDefaultPostAuthDestination("//evil.example"),
  "/onboarding",
);

assert.equal(getLearnGateRedirect("pending"), "/onboarding");
assert.equal(getLearnGateRedirect("placement_in_progress"), "/onboarding");
assert.equal(getLearnGateRedirect("completed"), null);
assert.equal(getOnboardingPageRedirect("completed"), "/learn");
assert.equal(getOnboardingPageRedirect("pending"), null);

console.log(
  "Onboarding redirect check passed: internal redirects remain safe, new users enter onboarding, and completed users return to learning.",
);
