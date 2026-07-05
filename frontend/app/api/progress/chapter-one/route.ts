import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getChapterOneProgressForUser,
  saveChapterOneProgressForUser,
} from "@/services/chapter-one-progress-service";
import { normalizeChapterOneProgressState } from "@/lib/chapter-one-progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await getChapterOneProgressForUser(session.user.id);

  return NextResponse.json({
    success: true,
    user: { id: session.user.id },
    progress,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const progress = await saveChapterOneProgressForUser(
    session.user.id,
    normalizeChapterOneProgressState(body?.progress ?? body)
  );

  return NextResponse.json({ success: true, progress });
}
