import "server-only";

import { sql } from "drizzle-orm";

import db from "@/db/drizzle";
import { getRuntimeEnvironmentStatus } from "@/lib/env/env-policy";

const REQUIRED_ADAPTIVE_TABLES = [
  "course_progress",
  "placement_test_results",
  "lesson_xp_claims",
  "quest_daily_stats",
  "user_streaks",
  "learning_sync_jobs",
  "adaptive_rate_limits",
] as const;

export type RuntimeReadinessResult = {
  ok: boolean;
  environment: ReturnType<typeof getRuntimeEnvironmentStatus>;
  database: "connected" | "unavailable" | "not-configured";
  schema: "ready" | "incomplete" | "not-checked";
  missingTables: string[];
};

const normalizeRows = (result: unknown): Array<Record<string, unknown>> => {
  if (Array.isArray(result)) return result as Array<Record<string, unknown>>;
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows?: unknown }).rows)
  ) {
    return (result as { rows: Array<Record<string, unknown>> }).rows;
  }
  return [];
};

export const checkRuntimeReadiness = async (): Promise<RuntimeReadinessResult> => {
  const environment = getRuntimeEnvironmentStatus();

  if (!environment.databaseConfigured) {
    return {
      ok: false,
      environment,
      database: "not-configured",
      schema: "not-checked",
      missingTables: [],
    };
  }

  try {
    await db.execute(sql`SELECT 1 AS ready`);
    const tableResult = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN (
          'course_progress',
          'placement_test_results',
          'lesson_xp_claims',
          'quest_daily_stats',
          'user_streaks',
          'learning_sync_jobs',
          'adaptive_rate_limits'
        )
    `);
    const existing = new Set(
      normalizeRows(tableResult)
        .map((row) => row.table_name)
        .filter((value): value is string => typeof value === "string"),
    );
    const missingTables = REQUIRED_ADAPTIVE_TABLES.filter(
      (table) => !existing.has(table),
    );

    return {
      ok: environment.ok && missingTables.length === 0,
      environment,
      database: "connected",
      schema: missingTables.length === 0 ? "ready" : "incomplete",
      missingTables: [...missingTables],
    };
  } catch {
    return {
      ok: false,
      environment,
      database: "unavailable",
      schema: "not-checked",
      missingTables: [],
    };
  }
};
