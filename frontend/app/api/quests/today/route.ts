import { NextResponse } from "next/server";

import { getCurrentQuestApiUser } from "../_quest-user";
import { getQuestTodayState } from "@/services/quest-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getCurrentQuestApiUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = await getQuestTodayState({
      userId: currentUser.id,
      currentStreak: 0,
    });

    return NextResponse.json({
      success: true,
      isLocalFallbackUser: currentUser.isLocalFallback,
      source: state.source,
      date: state.date,
      dailyCompleted: state.today.dailyCompleted,
      dailyTotal: state.today.dailyTotal,
      stats: state.today.stats,
      quests: state.today.quests,
      bonusQuests: state.today.bonusQuests,
      chest: state.today.chest,
      currentStreak: state.today.currentStreak,
      nextResetAt: state.today.nextResetAt,
      claimedQuestIds: state.today.claimedQuestIds,
      weekActivity: state.weekActivity,
      hasPersistedStats: state.hasPersistedStats,
      hasPersistedClaims: state.hasPersistedClaims,
    });
  } catch (error) {
    console.error("Failed to load quest today API", error);

    return NextResponse.json(
      {
        error: "Failed to load quest today state",
        code: "QUEST_TODAY_LOAD_FAILED",
      },
      { status: 500 },
    );
  }
}
