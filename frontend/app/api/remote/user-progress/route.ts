import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { courses, userProgress } from "@/db/schema";

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const operation = String(body.operation || "");
  const existing = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
  });

  if (operation === "select-course") {
    const courseId = Number(body.courseId);
    const course = Number.isInteger(courseId)
      ? await db.query.courses.findFirst({ where: eq(courses.id, courseId) })
      : null;
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    if (existing) {
      await db.update(userProgress).set({
        activeCourseId: courseId,
        userName: user.name || "User",
        userImageSrc: user.image || "/logo.webp",
      }).where(eq(userProgress.userId, user.id));
    } else {
      await db.insert(userProgress).values({
        userId: user.id,
        activeCourseId: courseId,
        userName: user.name || "User",
        userImageSrc: user.image || "/logo.webp",
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (operation === "league" && existing) {
    await db.update(userProgress).set({ league: Number(body.league) || 1 })
      .where(eq(userProgress.userId, user.id));
    return NextResponse.json({ ok: true });
  }

  if (operation === "status-emoji" && existing) {
    await db.update(userProgress).set({
      statusEmoji: typeof body.statusEmoji === "string" ? body.statusEmoji : null,
    }).where(eq(userProgress.userId, user.id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unsupported operation" }, { status: 400 });
}
