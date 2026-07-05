import { auth } from "@/auth";
import { getUserProgress } from "@/db/queries";
import { LeaderboardClient } from "./leaderboard-client";

export const dynamic = "force-dynamic";

const LeaderboardPage = async () => {
    const session = await auth();
    const userProgress = await getUserProgress();
    const isLoggedIn = Boolean(session?.user?.id);

    // Safely cast or get properties since TypeScript infers them from schema.ts
    const userLeague = (userProgress as any)?.league ?? 1;
    const userStatusEmoji = (userProgress as any)?.statusEmoji ?? null;

    return (
        <LeaderboardClient
            userId={userProgress?.userId ?? ""}
            initialUserName={userProgress?.userName ?? session?.user?.name ?? "Khách"}
            initialUserImageSrc={userProgress?.userImageSrc ?? session?.user?.image ?? "/mascot.svg"}
            initialPoints={userProgress?.points ?? 0}
            initialLeague={userLeague}
            initialStatusEmoji={userStatusEmoji}
            hearts={userProgress?.hearts ?? 5}
            activeCourse={{
                title: userProgress?.activeCourse?.title || "Tiếng Anh",
                imageSrc: userProgress?.activeCourse?.imageSrc || "/globe.svg",
            }}
            todayMinutes={43} // Simulated daily study minutes, matching Sidebar
            isLoggedIn={isLoggedIn}
        />
    );
};

export default LeaderboardPage;
