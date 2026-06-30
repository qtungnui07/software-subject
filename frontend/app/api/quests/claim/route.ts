import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "Quest reward claim is not connected to real XP yet.",
      code: "QUEST_CLAIM_NOT_IMPLEMENTED",
    },
    { status: 501 },
  );
}
