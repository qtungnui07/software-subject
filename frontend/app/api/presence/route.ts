import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getOnlineTtlSeconds,
  getUserPresence,
  markUserOffline,
  markUserOnline,
} from "@/lib/presence";
import { getStudyTime } from "@/services/study-time-service";

export const dynamic = "force-dynamic";

const STUDY_ACTIVE_TTL_SECONDS = 45;

const getAuthenticatedUserId = async () => {
  const session = await auth();

  return session?.user?.id ?? null;
};

const getStudyPresence = async (userId: string) => {
  try {
    const result = await getStudyTime(userId);
    if (!result.ok) {
      return {
        active: false,
        status: "off",
        lastTrackedAt: null,
        todaySeconds: 0,
        timeoutSeconds: STUDY_ACTIVE_TTL_SECONDS,
      };
    }

    const summary = result.data?.summary;
    const updatedAtMs = summary?.updatedAt ? Date.parse(summary.updatedAt) : NaN;
    const isRecent =
      Number.isFinite(updatedAtMs) &&
      Date.now() - updatedAtMs <= STUDY_ACTIVE_TTL_SECONDS * 1000;

    return {
      active: isRecent,
      status: isRecent ? "active" : "off",
      lastTrackedAt: summary?.updatedAt ?? null,
      todaySeconds: summary?.todaySeconds ?? 0,
      timeoutSeconds: STUDY_ACTIVE_TTL_SECONDS,
    };
  } catch (error) {
    console.warn("Could not load study presence", error);

    return {
      active: false,
      status: "off",
      lastTrackedAt: null,
      todaySeconds: 0,
      timeoutSeconds: STUDY_ACTIVE_TTL_SECONDS,
    };
  }
};

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [online, study] = await Promise.all([
    Promise.resolve(getUserPresence(userId)),
    getStudyPresence(userId),
  ]);

  return NextResponse.json({
    ok: true,
    userId,
    online: {
      ...online,
      timeoutSeconds: getOnlineTtlSeconds(),
    },
    study,
  });
}

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const active = body.active !== false;
  const online = active ? markUserOnline(userId) : markUserOffline(userId);

  return NextResponse.json({
    ok: true,
    userId,
    online: {
      ...online,
      timeoutSeconds: getOnlineTtlSeconds(),
    },
  });
}
