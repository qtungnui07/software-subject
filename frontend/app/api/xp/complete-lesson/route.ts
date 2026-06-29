import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { completeLessonXp } from "@/services/xp-service";

export const dynamic = "force-dynamic";

type CompleteLessonXpRequestBody = {
  lessonId?: unknown;
  accuracy?: unknown;
};

const parseAccuracy = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const parseBody = (body: CompleteLessonXpRequestBody) => {
  const lessonId = typeof body.lessonId === "string" ? body.lessonId.trim() : "";
  const accuracy = parseAccuracy(body.accuracy);

  if (!lessonId) {
    return {
      error: "lessonId is required",
      lessonId: null,
      accuracy: null,
    };
  }

  if (accuracy === null) {
    return {
      error: "accuracy is required and must be a number",
      lessonId: null,
      accuracy: null,
    };
  }

  return {
    error: null,
    lessonId,
    accuracy,
  };
};

const getCurrentXpUser = async () => {
  const session = await auth();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name || "User",
      image: session.user.image || "/mascot.svg",
      isDemoUser: false,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      id: "demo-user",
      name: "Demo User",
      image: "/mascot.svg",
      isDemoUser: true,
    };
  }

  return null;
};

export async function POST(request: Request) {
  const currentUser = await getCurrentXpUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as CompleteLessonXpRequestBody;
    const parsedBody = parseBody(body);

    if (parsedBody.error || !parsedBody.lessonId || parsedBody.accuracy === null) {
      return NextResponse.json({ error: parsedBody.error }, { status: 400 });
    }

    const result = await completeLessonXp({
      userId: currentUser.id,
      userName: currentUser.name,
      userImageSrc: currentUser.image,
      lessonId: parsedBody.lessonId,
      accuracy: parsedBody.accuracy,
    });

    return NextResponse.json({
      ...result,
      isDemoUser: currentUser.isDemoUser,
    });
  } catch (error) {
    console.error("Failed to complete lesson XP", error);

    return NextResponse.json(
      { error: "Failed to complete lesson XP" },
      { status: 500 }
    );
  }
}
