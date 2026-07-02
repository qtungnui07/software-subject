import { NextResponse } from "next/server";

import { getCurrentQuestApiUser } from "../../_quest-user";
import {
  claimDailyChestReward,
  isQuestServiceError,
} from "@/services/quest-service";

export const dynamic = "force-dynamic";

export async function POST() {
  const currentUser = await getCurrentQuestApiUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await claimDailyChestReward({
      userId: currentUser.id,
      userName: currentUser.name,
      userImageSrc: currentUser.image,
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

    console.error("Failed to claim quest chest", error);

    return NextResponse.json(
      { error: "Failed to claim quest chest", code: "QUEST_CHEST_CLAIM_FAILED" },
      { status: 500 },
    );
  }
}
