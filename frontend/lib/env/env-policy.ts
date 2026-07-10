export type RuntimeMode = "development" | "test" | "production";

const PRODUCTION_BUILD_PHASE = "phase-production-build";

export const getRuntimeMode = (): RuntimeMode => {
  if (process.env.NODE_ENV === "production") return "production";
  if (process.env.NODE_ENV === "test") return "test";
  return "development";
};

export const isProductionBuildPhase = () =>
  process.env.NEXT_PHASE === PRODUCTION_BUILD_PHASE ||
  process.env.npm_lifecycle_event === "build";

export const hasDatabaseUrl = () => Boolean(process.env.DATABASE_URL?.trim());

export const canUseOfflineDatabaseFallback = () => {
  const mode = getRuntimeMode();
  return mode !== "production" || isProductionBuildPhase();
};

export const mustRejectOfflineDatabaseAtRuntime = () =>
  getRuntimeMode() === "production" &&
  !isProductionBuildPhase() &&
  !hasDatabaseUrl();

export const getRuntimeEnvironmentStatus = () => {
  const mode = getRuntimeMode();
  const databaseConfigured = hasDatabaseUrl();
  const internalSyncConfigured = Boolean(
    process.env.INTERNAL_SYNC_SECRET?.trim(),
  );
  const appUrlConfigured = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());

  const missing: string[] = [];
  if (mode === "production" && !databaseConfigured) missing.push("DATABASE_URL");
  if (mode === "production" && !internalSyncConfigured) {
    missing.push("INTERNAL_SYNC_SECRET");
  }

  return {
    ok: missing.length === 0,
    mode,
    databaseConfigured,
    internalSyncConfigured,
    appUrlConfigured,
    buildPhase: isProductionBuildPhase(),
    missing,
  };
};
