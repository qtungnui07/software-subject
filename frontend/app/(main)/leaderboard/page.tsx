import { auth } from "@/auth";
import { resolveUserAvatar } from "@/constants/user-avatar";
import { getUserProgress } from "@/db/queries";
import { LeaderboardClient } from "./leaderboard-client";

export const dynamic = "force-dynamic";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getCurrentVietnamWeekdayIndex = () => {
    const weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
        weekday: "short",
    }).format(new Date());

    const index = WEEKDAY_LABELS.indexOf(weekday);
    return index >= 0 ? index : 0;
};

const LeaderboardPage = async () => {
    const [session, userProgress] = await Promise.all([
        auth(),
        getUserProgress(),
    ]);
    const isLoggedIn = Boolean(session?.user?.id);

    const userLeague = userProgress?.league ?? 1;
    const userStatusEmoji = userProgress?.statusEmoji ?? null;

    return (
        <LeaderboardClient
            userId={userProgress?.userId ?? ""}
            initialUserName={userProgress?.userName ?? session?.user?.name ?? "Khách"}
            initialUserImageSrc={resolveUserAvatar(userProgress?.userImageSrc ?? session?.user?.image)}
            initialPoints={userProgress?.points ?? 0}
            initialLeague={userLeague}
            initialStatusEmoji={userStatusEmoji}
            initialCurrentDayIndex={getCurrentVietnamWeekdayIndex()}
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
