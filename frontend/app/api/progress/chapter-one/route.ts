import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  migrateChapterOneProgressToCourseProgress,
  projectCourseProgressToChapterOne,
} from "@/lib/courses/chapter-one-adapter";
import { normalizeChapterOneProgressState } from "@/lib/chapter-one-progress";
import {
  getCourseProgressForUser,
  saveCourseProgressForUser,
} from "@/services/course-progress-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseProgress = await getCourseProgressForUser(session.user.id);
  const progress = projectCourseProgressToChapterOne(courseProgress);

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
  const legacyProgress = normalizeChapterOneProgressState(
    body?.progress ?? body
  );
  const existingCourseProgress = await getCourseProgressForUser(
    session.user.id
  );
  const courseProgress = await saveCourseProgressForUser(
    session.user.id,
    migrateChapterOneProgressToCourseProgress(
      legacyProgress,
      existingCourseProgress
    )
  );

  return NextResponse.json({
    success: true,
    progress: projectCourseProgressToChapterOne(courseProgress),
    courseProgress,
  });
}
