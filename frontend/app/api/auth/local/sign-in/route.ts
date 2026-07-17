import { NextResponse } from "next/server";

import { logger } from "@/lib/observability/logger";
import {
  getRequestId,
  requestIdHeaders,
} from "@/lib/observability/request-context";
import {
  adaptiveRateLimitHeaders,
  consumeAdaptiveRateLimit,
  getRequestNetworkIdentifier,
} from "@/lib/rate-limit/adaptive-rate-limit";
import { signInLocalUser, type SignInInput } from "@/services/auth-service";
import { setLocalSessionCookie } from "../_backend";

export async function POST(req: Request) {
  const requestId = getRequestId(req);
  const rateLimit = await consumeAdaptiveRateLimit({
    scope: "local-sign-in",
    identifier: getRequestNetworkIdentifier(req),
    limit: 10,
    windowMs: 10 * 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.",
        code: "RATE_LIMITED",
        requestId,
      },
      {
        status: 429,
        headers: {
          ...requestIdHeaders(requestId),
          ...adaptiveRateLimitHeaders(rateLimit),
        },
      },
    );
  }

  const input = (await req.json().catch(() => ({}))) as SignInInput;
  const result = await signInLocalUser(input);

  if (!result.ok) {
    logger.warn("local_sign_in_failed", { requestId, status: result.status });
    return NextResponse.json(
      { ...result.data, requestId },
      {
        status: result.status,
        headers: {
          ...requestIdHeaders(requestId),
          ...adaptiveRateLimitHeaders(rateLimit),
        },
      },
    );
  }

  const nextResponse = NextResponse.json(
    { ...result.data, requestId },
    {
      status: result.status,
      headers: {
        ...requestIdHeaders(requestId),
        ...adaptiveRateLimitHeaders(rateLimit),
      },
    },
  );
  await setLocalSessionCookie(nextResponse, result.data.user);
  return nextResponse;
}
