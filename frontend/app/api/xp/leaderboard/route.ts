import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { resolveUserAvatar } from "@/constants/user-avatar";
import { getXpLeaderboard } from "@/services/xp-service";

export const dynamic = "force-dynamic";

const getCurrentXpUser = async () => {
  const session = await auth();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name || "User",
      image: resolveUserAvatar(session.user.image),
    };
  }

  return null;
};

export async function GET() {
  const currentUser = await getCurrentXpUser();

  try {
    const leaderboard = await getXpLeaderboard({
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name,
      currentUserImageSrc: currentUser?.image,
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Failed to load XP leaderboard", error);

    return NextResponse.json(
      { error: "Failed to load XP leaderboard" },
      { status: 500 }
    );
  }
}
