import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const healthSource = readFileSync(
  resolve(process.cwd(), "app/api/health/route.ts"),
  "utf8",
);
const readySource = readFileSync(
  resolve(process.cwd(), "app/api/ready/route.ts"),
  "utf8",
);
const internalSource = readFileSync(
  resolve(process.cwd(), "app/api/internal/learning-sync/retry/route.ts"),
  "utf8",
);

assert.equal(healthSource.includes("db/drizzle"), false);
assert.equal(healthSource.includes("checkRuntimeReadiness"), false);
assert.equal(healthSource.includes("service: \"robogo\""), true);
assert.equal(readySource.includes("checkRuntimeReadiness"), true);
assert.equal(readySource.includes("status: readiness.ok ? 200 : 503"), true);
assert.equal(readySource.includes("DATABASE_URL"), false);
assert.equal(internalSource.includes("authorization"), true);
assert.equal(internalSource.includes("INTERNAL_SYNC_SECRET"), true);
assert.equal(internalSource.includes("Bearer"), true);

console.log(
  "Health and readiness check passed: liveness is database-independent, readiness validates runtime state, and the recovery endpoint requires a bearer secret.",
);
