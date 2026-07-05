import { NextResponse } from "next/server";

import { getCurrentQuestApiUser } from "../_quest-user";
import {
  claimDailyQuestReward,
  isQuestServiceError,
} from "@/services/quest-service";

export const dynamic = "force-dynamic";

type ClaimQuestRequestBody = {
  questId?: unknown;
};

const parseQuestId = (body: ClaimQuestRequestBody) => {
  return typeof body.questId === "string" ? body.questId.trim() : "";
};

export async function POST(request: Request) {
  const currentUser = await getCurrentQuestApiUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as ClaimQuestRequestBody;
    const questId = parseQuestId(body);

    if (!questId) {
      return NextResponse.json(
        { error: "questId is required", code: "QUEST_ID_REQUIRED" },
        { status: 400 },
      );
    }

    const result = await claimDailyQuestReward({
      userId: currentUser.id,
      userName: currentUser.name,
      userImageSrc: currentUser.image,
      questId,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (isQuestServiceError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.status },
      );
    }

    console.error("Failed to claim quest reward", error);

    return NextResponse.json(
      { error: "Failed to claim quest reward", code: "QUEST_CLAIM_FAILED" },
      { status: 500 },
    );
  }
}
