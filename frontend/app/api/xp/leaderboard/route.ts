import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getXpLeaderboard } from "@/services/xp-service";

export const dynamic = "force-dynamic";

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

export async function GET() {
  const currentUser = await getCurrentXpUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leaderboard = await getXpLeaderboard({
      currentUserId: currentUser.id,
      currentUserName: currentUser.name,
      currentUserImageSrc: currentUser.image,
    });

    return NextResponse.json({
      ...leaderboard,
      isDemoUser: currentUser.isDemoUser,
    });
  } catch (error) {
    console.error("Failed to load XP leaderboard", error);

    return NextResponse.json(
      { error: "Failed to load XP leaderboard" },
      { status: 500 }
    );
  }
}
