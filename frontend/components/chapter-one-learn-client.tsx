"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { FeedWrapper } from "@/components/feed-wrapper";
import { LessonPath } from "@/components/lesson-path";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { UnitProgressList } from "@/components/progress/unit-progress-list";
import { StreakCard } from "@/components/streak/streak-card";
import { StudyTimeCard } from "@/components/study-time-card";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { UserProgress } from "@/components/user-progress";
import { chapterOneDemoScope, chapterOneNodes } from "@/constants/chapter-one";
import type { ProgressLesson, ProgressUnit } from "@/data/progress-data";
import {
  claimChapterOneChest,
  getChapterOneNodeStatus,
  getChapterOneProgress,
  getInitialChapterOneProgress,
  saveChapterOneProgress,
  setChapterOneProgressOwner,
  subscribeChapterOneProgress,
  type ChapterOneNodeStatus,
  type ChapterOneProgressState,
} from "@/lib/chapter-one-progress";
import { getCourseProgressSummary } from "@/lib/progress-utils";
import type { StudyTimeSummary } from "@/services/study-time-service";

import { Header } from "@/app/(main)/learn/header";

const learnTransitionStorageKey = "robogo-learn-transition";
const learnPopupSeenStorageKey = "robogo-learn-popup-seen";

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

type ActiveCoursePreview = {
  title: string;
  imageSrc: string;
};

type Props = {
  activeCourse: ActiveCoursePreview;
  hearts: number;
  points: number;
  showAuthCard: boolean;
  initialStudyTimeSummary: StudyTimeSummary | null;
  progressOwnerId: string | null;
  initialProgressState: ChapterOneProgressState;
};

const getProgressLessonStatus = (
  nodeId: string,
  state: ChapterOneProgressState
): ProgressLesson["status"] => {
  const status: ChapterOneNodeStatus = getChapterOneNodeStatus(nodeId, state);

  return status === "available" ? "available" : status;
};

const buildChapterOneProgressUnits = (state: ChapterOneProgressState): ProgressUnit[] => [
  {
    id: 1,
    title: `${chapterOneDemoScope.unitTitle}: ${chapterOneDemoScope.chapterTitle}`,
    description:
      "Hoàn thành 6 bài học và 1 bài kiểm tra cuối chương. Rương thưởng không tính vào tiến độ chính.",
    iconSrc: "/learn.svg",
    lessons: chapterOneNodes
      .filter((node) => node.countsTowardProgress)
      .map((node) => ({
        id: node.legacyId,
        title: node.title,
        description: node.description,
        type: node.type === "checkpoint" ? "boss" : "lesson",
        status: getProgressLessonStatus(node.id, state),
        href: `/lesson/${node.id}`,
        objectives: [
          "Hoàn thành bài học trong luồng Chương 1.",
          "Đạt đủ điểm để mở khóa node tiếp theo.",
          "Giữ tiến độ demo ổn định từ đầu đến cuối chương.",
        ],
        estimatedMinutes: node.type === "checkpoint" ? 12 : 7,
        xpReward: node.xp,
      })),
  },
];

export const ChapterOneLearnClient = ({
  activeCourse,
  hearts,
  points,
  showAuthCard,
  initialStudyTimeSummary,
  progressOwnerId,
  initialProgressState,
}: Props) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const [progressState, setProgressState] = useState<ChapterOneProgressState>(
    getInitialChapterOneProgress
  );
  const [studyTimeSummary, setStudyTimeSummary] = useState<StudyTimeSummary | null>(
    initialStudyTimeSummary,
  );

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    if (localStorage.getItem(learnPopupSeenStorageKey) === "true") {
      return;
    }

    localStorage.setItem(learnPopupSeenStorageKey, "true");

    const isAfterHomeTransition =
      sessionStorage.getItem(learnTransitionStorageKey) === "pending";
    const delay = isAfterHomeTransition ? 1560 : 80;

    const startTimer = window.setTimeout(() => {
      shell.classList.remove("learn-page-shell-enter");
      shell.getBoundingClientRect();
      shell.classList.add("learn-page-shell-enter");
    }, delay);

    const cleanupTimer = window.setTimeout(() => {
      shell.classList.remove("learn-page-shell-enter");
    }, delay + 1200);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(cleanupTimer);
      shell.classList.remove("learn-page-shell-enter");
    };
  }, []);

  useEffect(() => {
    setChapterOneProgressOwner(progressOwnerId);
    saveChapterOneProgress(initialProgressState);

    const syncProgress = () => setProgressState(getChapterOneProgress());

    syncProgress();

    return subscribeChapterOneProgress(syncProgress);
  }, [initialProgressState, progressOwnerId]);

  const progressUnits = useMemo(
    () => buildChapterOneProgressUnits(progressState),
    [progressState]
  );
  const courseProgress = useMemo(
    () => getCourseProgressSummary(progressUnits),
    [progressUnits]
  );
  const todayMinutes = Math.floor((studyTimeSummary?.todaySeconds ?? 0) / 60);
  const totalStudySeconds = studyTimeSummary?.totalSeconds ?? 0;

  const handleClaimChest = (chestId: string) => {
    const nextState = claimChapterOneChest(chestId);
    setProgressState(nextState);

    void fetch("/api/progress/chapter-one", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: nextState }),
    }).catch((error) => {
      console.warn("Could not sync Chapter 1 chest progress:", error);
    });
  };

  return (
    <div
      ref={shellRef}
      className="learn-page-shell grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_425px] xl:items-start xl:gap-10"
    >
      <FeedWrapper>
        <section className="rounded-[28px] border-2 border-sky-100 dark:border-[#202f36] bg-white dark:bg-[#182226] shadow-sm">
          <div className="sticky top-[56px] z-40 bg-white/95 dark:bg-[#182226]/95 px-4 pb-4 pt-4 backdrop-blur sm:px-6 lg:top-0 lg:pt-6 rounded-t-[26px]">
            <Header
              courseTitle={chapterOneDemoScope.courseTitle}
              sectionLabel={chapterOneDemoScope.sectionLabel}
              chapterTitle={chapterOneDemoScope.chapterTitle}
            />
          </div>

          <div className="space-y-4 px-4 pb-4 pt-2 sm:px-6 xl:hidden">
            <ProgressOverview
              totalLessons={courseProgress.totalLessons}
              completedLessons={courseProgress.completedLessons}
              completionPercent={courseProgress.completionPercent}
              earnedXp={courseProgress.earnedXp}
              totalStudySeconds={totalStudySeconds}
            />

            <UnitProgressList units={progressUnits} />
          </div>

          <div className="px-4 pb-7 pt-2 sm:px-6 sm:pb-9">
            <LessonPath
              todayMinutes={todayMinutes}
              progressState={progressState}
              onClaimChest={handleClaimChest}
            />
          </div>
        </section>
      </FeedWrapper>

      <StickyWrapper>
        <div className="rounded-[24px] border-2 border-sky-100 dark:border-[#202f36] bg-white dark:bg-[#182226] p-4 shadow-sm">
          <UserProgress
            activeCourse={{ title: activeCourse.title, imageSrc: activeCourse.imageSrc }}
            hearts={hearts}
            points={points}
          />
        </div>

        <StreakCard />

        <StudyTimeCard
          initialSummary={initialStudyTimeSummary}
          isLoggedIn={!showAuthCard}
          onSummaryChange={setStudyTimeSummary}
        />

        <ProgressOverview
          className="hidden xl:block"
          totalLessons={courseProgress.totalLessons}
          completedLessons={courseProgress.completedLessons}
          completionPercent={courseProgress.completionPercent}
          earnedXp={courseProgress.earnedXp}
          totalStudySeconds={totalStudySeconds}
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

        {showAuthCard ? (
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
        ) : null}
      </StickyWrapper>
    </div>
  );
};
