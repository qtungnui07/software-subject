import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getStudyTime, trackStudyTime } from "@/services/study-time-service";

export const dynamic = "force-dynamic";

const parseDurationSeconds = (value: unknown) => {
  const durationSeconds =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;

  if (!Number.isFinite(durationSeconds)) {
    return 0;
  }

  return Math.trunc(durationSeconds);
};

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getStudyTime(session.user.id);

  return NextResponse.json(result.data, { status: result.status });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const durationSeconds = parseDurationSeconds(body.durationSeconds);

  if (durationSeconds <= 0) {
    return NextResponse.json(
      { error: "durationSeconds must be a positive number" },
      { status: 400 }
    );
  }

  const result = await trackStudyTime(session.user.id, { durationSeconds });

  return NextResponse.json(result.data, { status: result.status });
}
