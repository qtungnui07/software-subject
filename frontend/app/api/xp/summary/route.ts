import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getUserXpSummary } from "@/services/xp-service";

export const dynamic = "force-dynamic";

const getCurrentXpUser = async () => {
  const session = await auth();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      isDemoUser: false,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      id: "demo-user",
      isDemoUser: true,
    };
  }

  return null;
};

export async function GET() {
  const currentUser = await getCurrentXpUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getUserXpSummary({ userId: currentUser.id });

    return NextResponse.json({
      ...summary,
      isDemoUser: currentUser.isDemoUser,
    });
  } catch (error) {
    console.error("Failed to load XP summary", error);

    return NextResponse.json(
      { error: "Failed to load XP summary" },
      { status: 500 }
    );
  }
}
