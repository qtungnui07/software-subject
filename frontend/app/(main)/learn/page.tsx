import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FeedWrapper } from "@/components/feed-wrapper";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { UnitProgressList } from "@/components/progress/unit-progress-list";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { LessonPath } from "@/components/lesson-path";
import { Button } from "@/components/ui/button";
import { englishProgressCourse, progressUnits } from "@/data/progress-data";
import { getCourseProgressSummary } from "@/lib/progress-utils";
import { getUserProgress } from "@/db/queries";
import { StreakCard } from "@/components/streak/streak-card";
import { auth } from "@/auth";

import { Header } from "./header";

const todayMinutes = 43;

const sidebarCards = [
  {
    title: "Mở khóa Bảng xếp hạng",
    description: "Hoàn thành thêm 3 bài học để bắt đầu thi đua với người học khác.",
    iconSrc: "/leaderboard.svg",
  },
  {
    title: "Nhiệm vụ hằng ngày",
    description: "Kiếm 70 XP hôm nay để giữ nhịp học tập của bạn.",
    iconSrc: "/quests.svg",
  },
];

const LearnPage = async () => {
  const session = await auth();
  const userProgressData = await getUserProgress();

  if (!userProgressData || !userProgressData.activeCourseId) {
    redirect("/courses");
  }

  const activeCourse = userProgressData.activeCourse || { title: "Tiếng Anh", imageSrc: "/globe.svg" };
  const courseProgress = getCourseProgressSummary(englishProgressCourse);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_425px] xl:items-start xl:gap-10">
      <FeedWrapper>
        <section className="rounded-[28px] border-2 border-sky-100 dark:border-[#202f36] bg-white dark:bg-[#182226] shadow-sm">
          <div className="sticky top-[56px] z-40 bg-white/95 dark:bg-[#182226]/95 px-4 py-4 backdrop-blur sm:px-6 lg:top-4">
            <Header
              courseTitle={activeCourse.title}
              sectionLabel="Phần 1, Chương 1"
              chapterTitle="Giao tiếp cơ bản"
            />
          </div>

          <div className="space-y-4 px-4 pb-4 pt-2 sm:px-6 xl:hidden">
            <ProgressOverview
              totalLessons={courseProgress.totalLessons}
              completedLessons={courseProgress.completedLessons}
              completionPercent={courseProgress.completionPercent}
              earnedXp={courseProgress.earnedXp}
              completedMinutes={courseProgress.completedMinutes}
            />

            <UnitProgressList units={progressUnits} />
          </div>

          <div className="px-4 pb-7 pt-2 sm:px-6 sm:pb-9">
            <LessonPath todayMinutes={todayMinutes} />
          </div>
        </section>
      </FeedWrapper>

      <StickyWrapper>
        <div className="rounded-[24px] border-2 border-sky-100 dark:border-[#202f36] bg-white dark:bg-[#182226] p-4 shadow-sm">
          <UserProgress
            activeCourse={{ title: activeCourse.title, imageSrc: activeCourse.imageSrc }}
            hearts={userProgressData.hearts}
            points={userProgressData.points}
          />
        </div>

        <StreakCard />

        <ProgressOverview
          className="hidden xl:block"
          totalLessons={courseProgress.totalLessons}
          completedLessons={courseProgress.completedLessons}
          completionPercent={courseProgress.completionPercent}
          earnedXp={courseProgress.earnedXp}
          completedMinutes={courseProgress.completedMinutes}
        />

        <UnitProgressList className="hidden xl:block" units={progressUnits} />

        {sidebarCards.map((card) => (
          <div
            key={card.title}
            className="rounded-[24px] border-2 border-slate-200 dark:border-[#202f36] bg-white dark:bg-[#182226] p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 dark:bg-slate-800">
                <Image
                  src={card.iconSrc}
                  alt=""
                  width={42}
                  height={42}
                  className="drop-shadow-sm"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-700 dark:text-slate-100">{card.title}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {!session?.user && (
          <div className="rounded-[24px] border-2 border-slate-200 dark:border-[#202f36] bg-white dark:bg-[#182226] p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-700 dark:text-slate-100">Tạo hồ sơ</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
              Lưu chuỗi ngày học, tiến độ và phần thưởng trên mọi thiết bị.
            </p>
            <div className="mt-5 grid gap-3">
              <Button asChild variant="primary" className="h-12 rounded-2xl">
                <Link href="/sign-up">Tạo hồ sơ</Link>
              </Button>
              <Button asChild variant="primary-outline" className="h-12 rounded-2xl">
                <Link href="/sign-in">Đăng nhập</Link>
              </Button>
            </div>
          </div>
        )}
      </StickyWrapper>
    </div>
  );
};

export default LearnPage;