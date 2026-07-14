import { NextResponse } from "next/server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { courses, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  const url = new URL(request.url);
  const operation = url.searchParams.get("operation");

  if (operation === "courses") {
    return NextResponse.json({ data: await db.query.courses.findMany() });
  }

  if (operation === "course") {
    const courseId = Number(url.searchParams.get("courseId"));
    const data = Number.isInteger(courseId)
      ? await db.query.courses.findFirst({ where: eq(courses.id, courseId) })
      : null;
    return NextResponse.json({ data });
  }

  if (operation === "user-progress") {
    if (!session?.user?.id) return NextResponse.json({ data: null });
    const data = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, session.user.id),
      with: { activeCourse: true },
    });
    return NextResponse.json({ data: data ?? null });
  }

  return NextResponse.json({ error: "Unsupported operation" }, { status: 400 });
}
