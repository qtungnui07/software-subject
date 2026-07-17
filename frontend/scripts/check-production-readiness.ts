import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { redactLogData } from "@/lib/observability/redact-log-data";

const schemaSql = readFileSync(resolve(process.cwd(), "lib/schema.sql"), "utf8");
const drizzleSource = readFileSync(resolve(process.cwd(), "db/drizzle.ts"), "utf8");
const envPolicySource = readFileSync(
  resolve(process.cwd(), "lib/env/env-policy.ts"),
  "utf8",
);
const rateLimitSource = readFileSync(
  resolve(process.cwd(), "lib/rate-limit/adaptive-rate-limit.ts"),
  "utf8",
);
const apiResponseSource = readFileSync(
  resolve(process.cwd(), "lib/errors/api-response.ts"),
  "utf8",
);

for (const forbidden of ["DROP TABLE", "TRUNCATE TABLE", "DELETE FROM"]) {
  assert.equal(schemaSql.toUpperCase().includes(forbidden), false);
}
for (const required of [
  "CREATE TABLE IF NOT EXISTS learning_sync_jobs",
  "learning_sync_jobs_user_node_system_idx",
  "CREATE TABLE IF NOT EXISTS adaptive_rate_limits",
  "adaptive_rate_limits_scope_identifier_window_idx",
]) {
  assert.equal(schemaSql.includes(required), true, `Missing ${required}.`);
}

assert.equal(drizzleSource.includes("canUseOfflineDatabaseFallback"), true);
assert.equal(
  drizzleSource.includes("DATABASE_URL is required at production runtime"),
  true,
);
assert.equal(envPolicySource.includes("phase-production-build"), true);
assert.equal(rateLimitSource.includes("sha256"), true);
assert.equal(rateLimitSource.includes("retry-after"), true);
assert.equal(apiResponseSource.includes("requestIdHeaders"), true);

const redacted = redactLogData({
  password: "secret-password",
  authorization: "Bearer token",
  nested: { DATABASE_URL: "postgres://secret", safe: "ok" },
  answers: [{ value: "private-answer" }],
}) as Record<string, unknown>;
assert.equal(redacted.password, "[REDACTED]");
assert.equal(redacted.authorization, "[REDACTED]");
assert.equal((redacted.nested as Record<string, unknown>).DATABASE_URL, "[REDACTED]");
assert.equal((redacted.nested as Record<string, unknown>).safe, "ok");
assert.equal(redacted.answers, "[REDACTED]");

console.log(
  "Production readiness check passed: runtime database guards, safe schema changes, request correlation, redacted logs, and adaptive rate limiting are valid.",
);
