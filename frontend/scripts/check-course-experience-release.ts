import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type PackageManifest = {
  scripts?: Record<string, string>;
};

const root = process.cwd();

const packageJson = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
) as PackageManifest;

const requiredChecks = [
  "check:course-experience-baseline",
  "check:real-study-time",
  "check:roadmap-node-popover",
  "check:lesson-detail-integration",
  "check:roadmap-copy-cleanup",
  "check:robogo-avatar-migration",
  "check:lesson-action-theme",
  "check:sections-page",
  "check:learn-sections-integration",
  "check:course-roadmap-integration",
] as const;

for (const scriptName of requiredChecks) {
  if (!packageJson.scripts?.[scriptName]) {
    throw new Error(
      `Release check cannot start because package.json is missing ${scriptName}.`,
    );
  }
}

const npmCliPath = process.env.npm_execpath;

if (!npmCliPath) {
  throw new Error(
    "npm_execpath is unavailable. Run this check through npm run check:course-experience-release.",
  );
}

const startedAt = Date.now();

for (const [index, scriptName] of requiredChecks.entries()) {
  console.log(
    `\n[${index + 1}/${requiredChecks.length}] Running ${scriptName}...`,
  );

  const result = spawnSync(
    process.execPath,
    [npmCliPath, "run", scriptName],
    {
      cwd: root,
      env: process.env,
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw new Error(
      `Unable to start ${scriptName}: ${result.error.message}`,
      {
        cause: result.error,
      },
    );
  }

  if (result.signal) {
    throw new Error(
      `Course experience release check stopped because ${scriptName} was terminated by signal ${result.signal}.`,
    );
  }

  if (result.status !== 0) {
    throw new Error(
      `Course experience release check stopped because ${scriptName} failed with exit code ${result.status ?? "unknown"}.`,
    );
  }
}

const durationSeconds = Math.max(
  1,
  Math.round((Date.now() - startedAt) / 1000),
);

console.log(
  `\nCourse experience release check passed: ${requiredChecks.length} Phase 0-8 regression checks completed in ${durationSeconds}s without changing runtime data.`,
);