import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      error: "Quest today API is not connected to database yet.",
      code: "QUEST_TODAY_NOT_IMPLEMENTED",
    },
    { status: 501 },
  );
}
