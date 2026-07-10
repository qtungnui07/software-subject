export type AdaptiveErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_REQUEST"
  | "NODE_LOCKED"
  | "NODE_NOT_FOUND"
  | "SECTION_LOCKED"
  | "RESULT_NOT_FOUND"
  | "VERSION_CONFLICT"
  | "DATABASE_UNAVAILABLE"
  | "PROGRESS_CONFLICT"
  | "SYNC_PARTIAL"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type AdaptiveErrorIssue = {
  field?: string;
  message: string;
};

export class AdaptiveAppError extends Error {
  constructor(
    public readonly code: AdaptiveErrorCode,
    message: string,
    public readonly status: number,
    public readonly issues: AdaptiveErrorIssue[] = [],
  ) {
    super(message);
    this.name = "AdaptiveAppError";
  }
}

export const getSafeAdaptiveError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại.",
) => {
  if (error instanceof AdaptiveAppError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status,
      issues: error.issues,
    };
  }

  return {
    code: "INTERNAL_ERROR" as const,
    message: fallbackMessage,
    status: 500,
    issues: [] as AdaptiveErrorIssue[],
  };
};
