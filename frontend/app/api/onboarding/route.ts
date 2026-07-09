import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  adaptiveErrorResponse,
  adaptiveUnauthorizedResponse,
} from "@/lib/errors/api-response";
import { findPrivilegedTopLevelFields } from "@/lib/hardening/adaptive-api-security";
import { isOnboardingChoice } from "@/lib/onboarding/onboarding-policy";
import {
  chooseBasicOnboardingForUser,
  getOnboardingStateForUser,
  startPlacementOnboardingForUser,
} from "@/services/onboarding-service";

export const dynamic = "force-dynamic";

const getCurrentUserId = async () => {
  const session = await auth().catch(() => null);
  return session?.user?.id ?? null;
};

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return adaptiveUnauthorizedResponse();
  }

  try {
    const onboarding = await getOnboardingStateForUser(userId);

    return NextResponse.json(
      { success: true, onboarding },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to load onboarding state", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể tải trạng thái thiết lập lộ trình.",
      503,
    );
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return adaptiveUnauthorizedResponse();
  }

  const body = (await request.json().catch(() => null)) as
    | { choice?: unknown }
    | null;
  const privilegedFields = findPrivilegedTopLevelFields(body);
  if (privilegedFields.length > 0) {
    return adaptiveErrorResponse(
      "INVALID_REQUEST",
      "Request chứa trường chỉ được phép tính ở server.",
      400,
    );
  }

  const choice = body?.choice;

  if (!isOnboardingChoice(choice)) {
    return adaptiveErrorResponse(
      "INVALID_REQUEST",
      "Lựa chọn onboarding không hợp lệ.",
      400,
    );
  }

  try {
    const onboarding =
      choice === "basic"
        ? await chooseBasicOnboardingForUser(userId)
        : await startPlacementOnboardingForUser(userId);

    return NextResponse.json(
      { success: true, onboarding },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to update onboarding state", {
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return adaptiveErrorResponse(
      "DATABASE_UNAVAILABLE",
      "Không thể cập nhật lộ trình lúc này.",
      503,
    );
  }
}
