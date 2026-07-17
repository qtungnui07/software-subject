import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env.local"), override: false });
config({ path: resolve(process.cwd(), ".env"), override: false });

const REQUIRED_TABLE_COLUMNS: Record<string, string[]> = {
  chapter_one_progress: [
    "user_id",
    "completed_lessons",
    "claimed_chests",
    "completed_checkpoint",
  ],
  course_progress: [
    "user_id",
    "course_id",
    "current_section_id",
    "unlocked_section_ids",
    "completed_node_ids",
    "checkpoint_scores",
    "onboarding_status",
    "onboarding_choice",
    "onboarding_completed_at",
  ],
  placement_test_results: [
    "user_id",
    "course_id",
    "test_version",
    "latest_assigned_section_id",
    "highest_assigned_section_id",
    "attempt_count",
    "last_submission_id",
  ],
  lesson_xp_claims: ["user_id", "lesson_id", "earned_xp"],
  user_streaks: ["user_id", "current_streak", "last_study_date"],
  quest_daily_stats: [
    "user_id",
    "stat_date",
    "lessons_completed",
    "xp_earned",
  ],
  quest_reward_claims: ["user_id", "quest_id", "claim_date", "reward_xp"],
  learning_sync_jobs: [
    "user_id",
    "node_id",
    "system",
    "status",
    "attempts",
    "next_retry_at",
    "payload_json",
  ],
  adaptive_rate_limits: [
    "id",
    "scope",
    "identifier_hash",
    "window_start",
    "request_count",
    "expires_at",
  ],
};

const REQUIRED_UNIQUE_INDEXES = [
  "course_progress_user_course_idx",
  "placement_test_results_user_course_idx",
  "lesson_xp_claims_user_lesson_idx",
  "quest_daily_stats_user_date_idx",
  "quest_reward_claims_user_quest_date_idx",
  "learning_sync_jobs_user_node_system_idx",
  "adaptive_rate_limits_scope_identifier_window_idx",
];

const assertStaticSchemaContract = () => {
  const drizzleSource = readFileSync(resolve(process.cwd(), "db/schema.ts"), "utf8");
  const sqlSource = readFileSync(resolve(process.cwd(), "lib/schema.sql"), "utf8");

  for (const [tableName, columns] of Object.entries(REQUIRED_TABLE_COLUMNS)) {
    assert.equal(
      drizzleSource.includes(`\"${tableName}\"`) ||
        drizzleSource.includes(`'${tableName}'`),
      true,
      `db/schema.ts is missing ${tableName}.`,
    );
    assert.equal(
      sqlSource.includes(`CREATE TABLE IF NOT EXISTS ${tableName}`),
      true,
      `lib/schema.sql is missing ${tableName}.`,
    );

    for (const column of columns) {
      assert.equal(
        sqlSource.includes(column),
        true,
        `lib/schema.sql is missing ${tableName}.${column}.`,
      );
    }
  }

  for (const indexName of REQUIRED_UNIQUE_INDEXES) {
    assert.equal(
      drizzleSource.includes(indexName),
      true,
      `db/schema.ts is missing ${indexName}.`,
    );
    assert.equal(
      sqlSource.includes(indexName),
      true,
      `lib/schema.sql is missing ${indexName}.`,
    );
  }
};

const assertLiveDatabaseContract = async (databaseUrl: string) => {
  const sql = postgres(databaseUrl, {
    max: 1,
    connect_timeout: 8,
    idle_timeout: 2,
  });

  try {
    const columnRows = await sql<{
      table_name: string;
      column_name: string;
    }[]>`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `;
    const columnsByTable = new Map<string, Set<string>>();
    for (const row of columnRows) {
      const columns = columnsByTable.get(row.table_name) ?? new Set<string>();
      columns.add(row.column_name);
      columnsByTable.set(row.table_name, columns);
    }

    for (const [tableName, columns] of Object.entries(REQUIRED_TABLE_COLUMNS)) {
      const liveColumns = columnsByTable.get(tableName);
      assert.ok(liveColumns, `Live database is missing ${tableName}.`);
      for (const column of columns) {
        assert.equal(
          liveColumns.has(column),
          true,
          `Live database is missing ${tableName}.${column}.`,
        );
      }
    }

    const indexRows = await sql<{ indexname: string }[]>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
    `;
    const indexNames = new Set(indexRows.map((row) => row.indexname));
    for (const indexName of REQUIRED_UNIQUE_INDEXES) {
      assert.equal(
        indexNames.has(indexName),
        true,
        `Live database is missing ${indexName}.`,
      );
    }
  } finally {
    await sql.end({ timeout: 2 });
  }
};

const main = async () => {
  assertStaticSchemaContract();

  const databaseUrl = process.env.DATABASE_URL?.trim();
  const skipLive = process.env.SKIP_LIVE_DATABASE_CHECK === "1";

  if (databaseUrl && !skipLive) {
    await assertLiveDatabaseContract(databaseUrl);
    console.log(
      "Database contract check passed: static schema and read-only live PostgreSQL tables, columns, and unique indexes are valid.",
    );
    return;
  }

  console.log(
    "Database contract check passed: static schema is valid. Live PostgreSQL check skipped because DATABASE_URL is absent or SKIP_LIVE_DATABASE_CHECK=1.",
  );
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
