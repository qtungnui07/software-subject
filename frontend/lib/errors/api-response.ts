import { NextResponse } from "next/server";

import type {
  AdaptiveErrorCode,
  AdaptiveErrorIssue,
} from "@/lib/errors/app-error";
import {
  createRequestId,
  requestIdHeaders,
} from "@/lib/observability/request-context";

export type AdaptiveApiErrorBody = {
  ok: false;
  error: string;
  code: AdaptiveErrorCode;
  requestId: string;
  details: {
    code: AdaptiveErrorCode;
    message: string;
    issues?: AdaptiveErrorIssue[];
  };
};

export const createAdaptiveErrorBody = (
  code: AdaptiveErrorCode,
  message: string,
  issues: AdaptiveErrorIssue[] = [],
  requestId = createRequestId(),
): AdaptiveApiErrorBody => ({
  ok: false,
  error: message,
  code,
  requestId,
  details: {
    code,
    message,
    ...(issues.length > 0 ? { issues } : {}),
  },
});

export const adaptiveErrorResponse = (
  code: AdaptiveErrorCode,
  message: string,
  status: number,
  issues: AdaptiveErrorIssue[] = [],
  requestId = createRequestId(),
  extraHeaders: Record<string, string> = {},
) =>
  NextResponse.json(createAdaptiveErrorBody(code, message, issues, requestId), {
    status,
    headers: { ...requestIdHeaders(requestId), ...extraHeaders },
  });

export const adaptiveUnauthorizedResponse = (requestId = createRequestId()) =>
  adaptiveErrorResponse(
    "UNAUTHORIZED",
    "Bạn cần đăng nhập để thực hiện thao tác này.",
    401,
    [],
    requestId,
  );
