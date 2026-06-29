import { redirect } from "next/navigation";
import { getUserProgress } from "@/db/queries";
import { LeaderboardClient } from "./leaderboard-client";

export const dynamic = "force-dynamic";

const LeaderboardPage = async () => {
    const userProgress = await getUserProgress();

    if (!userProgress || !userProgress.activeCourseId) {
        redirect("/courses");
    }

    // Safely cast or get properties since TypeScript infers them from schema.ts
    const userLeague = (userProgress as any).league ?? 1;
    const userStatusEmoji = (userProgress as any).statusEmoji ?? null;

    return (
        <LeaderboardClient
            userId={userProgress.userId}
            initialUserName={userProgress.userName}
            initialUserImageSrc={userProgress.userImageSrc}
            initialPoints={userProgress.points}
            initialLeague={userLeague}
            initialStatusEmoji={userStatusEmoji}
            hearts={userProgress.hearts}
            activeCourse={{
                title: userProgress.activeCourse?.title || "Tiếng Anh",
                imageSrc: userProgress.activeCourse?.imageSrc || "/globe.svg",
            }}
            todayMinutes={43} // Simulated daily study minutes, matching Sidebar
        />
    );
};

export default LeaderboardPage;
