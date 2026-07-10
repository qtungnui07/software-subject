import { NextResponse } from "next/server";

import {
  getRequestId,
  requestIdHeaders,
} from "@/lib/observability/request-context";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  return NextResponse.json(
    {
      ok: true,
      service: "robogo",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      requestId,
    },
    { headers: requestIdHeaders(requestId) },
  );
}
