import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  DEFAULT_USER_AVATAR,
  resolveUserAvatar,
} from "@/constants/user-avatar";

const root = process.cwd();
const repoRoot = join(root, "..");
const resolve = (path: string) => join(root, path);
const read = (path: string) => readFileSync(resolve(path), "utf8");

assert.equal(DEFAULT_USER_AVATAR, "/Robogo.svg");
assert.equal(resolveUserAvatar(null), DEFAULT_USER_AVATAR);
assert.equal(resolveUserAvatar(""), DEFAULT_USER_AVATAR);
assert.equal(resolveUserAvatar("   "), DEFAULT_USER_AVATAR);
assert.equal(resolveUserAvatar("/mascot.svg"), DEFAULT_USER_AVATAR);
assert.equal(resolveUserAvatar("mascot.svg"), DEFAULT_USER_AVATAR);
assert.equal(resolveUserAvatar(" https://img.clerk.com/user.png "), "https://img.clerk.com/user.png");
assert.equal(resolveUserAvatar("/custom-avatar.png"), "/custom-avatar.png");

assert.equal(existsSync(resolve("public/Robogo.svg")), true, "Robogo.svg must exist.");
assert.equal(existsSync(resolve("public/mascot.svg")), false, "The legacy owl asset must be deleted.");

const require = createRequire(import.meta.url);
const backendAvatar = require(join(repoRoot, "backend/src/user-avatar.js")) as {
  DEFAULT_USER_AVATAR: string;
  resolveUserAvatar: (value?: string | null) => string;
};
assert.equal(backendAvatar.DEFAULT_USER_AVATAR, DEFAULT_USER_AVATAR);
assert.equal(backendAvatar.resolveUserAvatar("/mascot.svg"), DEFAULT_USER_AVATAR);
assert.equal(backendAvatar.resolveUserAvatar("https://example.com/avatar.png"), "https://example.com/avatar.png");

const allowedLegacyFiles = new Set([
  "backend/src/user-avatar.js",
  "frontend/constants/user-avatar.ts",
  "frontend/db/migrations/20260716_replace_mascot_with_robogo.sql",
  "frontend/scripts/check-robogo-avatar-migration.ts",
]);
const ignoredDirectories = new Set([".git", ".next", ".next.bad-permissions", "node_modules"]);
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".sql", ".yaml", ".yml"]);
const legacyLiteral = "mascot.svg";
const unexpectedLegacyFiles: string[] = [];

const walk = (directory: string) => {
  for (const entry of readdirSync(directory)) {
    if (ignoredDirectories.has(entry)) continue;

    const absolute = join(directory, entry);
    const stats = statSync(absolute);

    if (stats.isDirectory()) {
      walk(absolute);
      continue;
    }

    const extension = entry.slice(entry.lastIndexOf("."));
    if (!sourceExtensions.has(extension)) continue;

    const relativePath = relative(repoRoot, absolute).replaceAll("\\", "/");
    const source = readFileSync(absolute, "utf8");

    if (source.includes(legacyLiteral) && !allowedLegacyFiles.has(relativePath)) {
      unexpectedLegacyFiles.push(relativePath);
    }
  }
};

walk(join(repoRoot, "frontend"));
walk(join(repoRoot, "backend"));
assert.deepEqual(
  unexpectedLegacyFiles,
  [],
  `Legacy owl references remain outside the compatibility allowlist:\n${unexpectedLegacyFiles.join("\n")}`,
);

const schemaSource = read("db/schema.ts");
const authSource = read("auth.ts");
const profileFormSource = read("app/(main)/profile/profile-form.tsx");
const migrationSource = read("db/migrations/20260716_replace_mascot_with_robogo.sql");
const migrationRunnerSource = read("scripts/migrate-robogo-avatar.ts");
const backendSource = readFileSync(join(repoRoot, "backend/src/server.js"), "utf8");
const packageSource = read("package.json");

assert(
  schemaSource.includes("default(DEFAULT_USER_AVATAR)"),
  "Database schema defaults must use the shared Robogo avatar constant.",
);
assert(
  authSource.includes("resolveUserAvatar") && !authSource.includes(legacyLiteral),
  "Auth must normalize missing and legacy avatars through the shared resolver.",
);
assert(
  profileFormSource.includes('avatar.label === "Robogo"') &&
    profileFormSource.includes("DEFAULT_USER_AVATAR"),
  "Profile presets must expose Robogo and must not filter it out.",
);
assert(
  backendSource.includes('require("./user-avatar")') && !backendSource.includes(legacyLiteral),
  "Backend account responses and writes must use the backend avatar resolver.",
);
assert(
  migrationSource.includes("UPDATE users") &&
    migrationSource.includes("UPDATE user_progress") &&
    migrationSource.includes("WHERE image_src") &&
    migrationSource.includes("WHERE user_image_src"),
  "Migration must update only missing or legacy avatar rows in both avatar tables.",
);
assert(
  migrationRunnerSource.includes("Dry run only") && migrationRunnerSource.includes("--apply"),
  "Database migration must be manual and preview changes before applying them.",
);
assert(
  packageSource.includes('"check:robogo-avatar-migration"') &&
    packageSource.includes('"migrate:robogo-avatar"'),
  "package.json must expose avatar verification and manual migration commands.",
);

console.log(
  "Robogo avatar migration check passed: Robogo.svg is the only default avatar, legacy owl paths are normalized safely, custom avatars are preserved, and the database migration is manual and scoped.",
);
