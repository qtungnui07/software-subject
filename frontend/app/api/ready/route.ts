import { NextResponse } from "next/server";

import { checkRuntimeReadiness } from "@/lib/env/validate-runtime-env";
import { logger } from "@/lib/observability/logger";
import {
  getRequestId,
  requestIdHeaders,
} from "@/lib/observability/request-context";
import { getLearningSyncJobSummary } from "@/services/learning-sync-recovery-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  const readiness = await checkRuntimeReadiness();
  const syncJobs =
    readiness.database === "connected"
      ? await getLearningSyncJobSummary().catch(() => null)
      : null;

  if (!readiness.ok) {
    logger.warn("runtime_not_ready", {
      requestId,
      database: readiness.database,
      schema: readiness.schema,
      missingEnvironment: readiness.environment.missing,
      missingTables: readiness.missingTables,
    });
  }

  return NextResponse.json(
    {
      ok: readiness.ok,
      service: "robogo",
      database: readiness.database,
      adaptiveLearning: readiness.schema,
      missingEnvironment: readiness.environment.missing,
      missingTables: readiness.missingTables,
      syncJobs,
      requestId,
    },
    {
      status: readiness.ok ? 200 : 503,
      headers: requestIdHeaders(requestId),
    },
  );
}
