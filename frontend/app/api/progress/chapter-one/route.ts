import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  migrateChapterOneProgressToCourseProgress,
  projectCourseProgressToChapterOne,
} from "@/lib/courses/chapter-one-adapter";
import {
  getCourseProgressForUser,
  saveCourseProgressForUser,
} from "@/services/course-progress-service";
import { getContentCourse } from "@/services/content-service";
import type { ChapterOneProgressState } from "@/lib/chapter-one-progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [courseProgress, course] = await Promise.all([
    getCourseProgressForUser(session.user.id),
    getContentCourse("english"),
  ]);
  const progress = projectCourseProgressToChapterOne(courseProgress, course);

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
  const legacyProgress = (body?.progress ?? body) as Partial<ChapterOneProgressState>;
  const [existingCourseProgress, course] = await Promise.all([
    getCourseProgressForUser(session.user.id),
    getContentCourse("english"),
  ]);
  const courseProgress = await saveCourseProgressForUser(
    session.user.id,
    migrateChapterOneProgressToCourseProgress(
      legacyProgress,
      course,
      existingCourseProgress,
    )
  );

  return NextResponse.json({
    success: true,
    progress: projectCourseProgressToChapterOne(courseProgress, course),
    courseProgress,
  });
}
