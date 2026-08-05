"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Header } from "@/app/(main)/learn/header";
import { FeedWrapper } from "@/components/feed-wrapper";
import { SectionLearningPath } from "@/components/learn/section-learning-path";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { UnitProgressList } from "@/components/progress/unit-progress-list";
import { StreakCard } from "@/components/streak/streak-card";
import { StudyTimeCard } from "@/components/study-time-card";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { UserProgress } from "@/components/user-progress";
import type { ProgressLesson, ProgressUnit } from "@/data/progress-data";
import { canAccessCourseNode } from "@/lib/courses/course-unlock-policy";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import { getCourseProgressSummary } from "@/lib/progress-utils";
import type { StudyTimeSummary } from "@/services/study-time-service";
import type { CourseDefinition } from "@/types/course";

const learnTransitionStorageKey = "robogo-learn-transition";
const learnPopupSeenStorageKey = "robogo-learn-popup-seen";

const sidebarCards = [
  {
    title: "Mở khóa Bảng xếp hạng",
    description:
      "Hoàn thành thêm 3 bài học để bắt đầu thi đua với người học khác.",
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
  courseDefinition: CourseDefinition;
  activeCourse: ActiveCoursePreview;
  hearts: number;
  points: number;
  showAuthCard: boolean;
  initialStudyTimeSummary: StudyTimeSummary | null;
  progressOwnerId: string | null;
  initialCourseProgressState: CourseProgressState;
};

const buildGenericProgressUnits = (
  course: CourseDefinition,
  sectionId: string,
  state: CourseProgressState,
): ProgressUnit[] => {
  const section = course.sections.find((item) => item.id === sectionId);
  if (!section) return [];

  return [
    {
      id: section.order,
      title: section.chapter.title,
      description: section.chapter.description,
      iconSrc: "/learn.svg",
      lessons: section.chapter.nodes
        .filter((node) => node.countsTowardProgress)
        .map((node) => {
          const completed = state.completedNodeIds.includes(node.id);
          const current =
            !completed && canAccessCourseNode(state, node.id, course);
          return {
            id: node.order,
            title: node.title,
            description: node.description,
            type: node.type === "checkpoint" ? "boss" : "lesson",
            status: completed ? "completed" : current ? "current" : "locked",
            href: node.href ?? "/learn",
            objectives: ["Hoàn thành bài học.", "Mở khóa node tiếp theo."],
            estimatedMinutes: node.type === "checkpoint" ? 12 : 8,
            xpReward: node.xp,
          } satisfies ProgressLesson;
        }),
    },
  ];
};

export const CourseLearnClient = ({
  courseDefinition,
  activeCourse,
  hearts,
  showAuthCard,
  initialStudyTimeSummary,
  progressOwnerId,
  initialCourseProgressState,
}: Props) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgressState>(
    initialCourseProgressState,
  );
  const [studyTimeSummary, setStudyTimeSummary] = useState<StudyTimeSummary | null>(
    initialStudyTimeSummary,
  );

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || localStorage.getItem(learnPopupSeenStorageKey) === "true")
      return;

    localStorage.setItem(learnPopupSeenStorageKey, "true");
    const isAfterHomeTransition =
      sessionStorage.getItem(learnTransitionStorageKey) === "pending";
    const delay = isAfterHomeTransition ? 1560 : 80;
    const startTimer = window.setTimeout(() => {
      shell.classList.remove("learn-page-shell-enter");
      shell.getBoundingClientRect();
      shell.classList.add("learn-page-shell-enter");
    }, delay);
    const cleanupTimer = window.setTimeout(
      () => shell.classList.remove("learn-page-shell-enter"),
      delay + 1200,
    );

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(cleanupTimer);
    };
  }, []);

  useEffect(() => {
    if (!progressOwnerId) return;

    let isMounted = true;

    const refreshCourseProgress = async () => {
      try {
        const response = await fetch("/api/progress/course", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as {
          progress?: CourseProgressState;
        };

        if (!isMounted || !data.progress) return;

        setCourseProgress(data.progress);
      } catch (error) {
        console.warn("Could not refresh course progress:", error);
      }
    };

    void refreshCourseProgress();

    return () => {
      isMounted = false;
    };
  }, [progressOwnerId]);

  const selectedSection =
    courseDefinition.sections.find(
      (section) => section.id === courseProgress.currentSectionId,
    ) ?? courseDefinition.sections[0];
  const selectedRoadmapProgress = courseProgress;
  const progressUnits = useMemo(
    () =>
      buildGenericProgressUnits(
        courseDefinition,
        selectedSection.id,
        courseProgress,
      ),
    [courseDefinition, courseProgress, selectedSection.id],
  );
  const progressSummary = useMemo(
    () => getCourseProgressSummary(progressUnits),
    [progressUnits],
  );
  const todayMinutes = Math.floor((studyTimeSummary?.todaySeconds ?? 0) / 60);
  const totalStudySeconds = studyTimeSummary?.totalSeconds ?? 0;

  const handleClaimReward = async (nodeId: string) => {
    const response = await fetch("/api/progress/course/claim-reward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId }),
    });

    const data = (await response.json().catch(() => null)) as {
      progress?: CourseProgressState;
      message?: string;
    } | null;

    if (!response.ok || !data?.progress) {
      throw new Error(data?.message ?? "Không thể nhận Freeze lúc này.");
    }

    setCourseProgress(data.progress);
  };

  return (
    <div
      ref={shellRef}
      className="learn-page-shell grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_425px] xl:items-start xl:gap-10"
    >
      <FeedWrapper>
        <section className="rounded-[28px] border-2 border-sky-100 bg-white shadow-sm dark:border-[#202f36] dark:bg-[#182226]">
          <div className="sticky top-[56px] z-40 rounded-t-[26px] bg-white/95 px-4 pb-4 pt-4 backdrop-blur dark:bg-[#182226]/95 sm:px-6 lg:top-0 lg:pt-6">
            <Header
              courseTitle={courseDefinition.title}
              sectionLabel={selectedSection.title}
              chapterTitle={selectedSection.chapter.title}
            />
          </div>

          <div className="space-y-4 px-4 pb-4 pt-2 sm:px-6 xl:hidden">
            <ProgressOverview
              totalLessons={progressSummary.totalLessons}
              completedLessons={progressSummary.completedLessons}
              completionPercent={progressSummary.completionPercent}
              earnedXp={progressSummary.earnedXp}
              totalStudySeconds={totalStudySeconds}
            />
            <UnitProgressList units={progressUnits} />
          </div>
          <div className="px-4 pb-7 pt-2 sm:px-6 sm:pb-9">
            <SectionLearningPath
              course={courseDefinition}
              section={selectedSection}
              progress={selectedRoadmapProgress}
              todayMinutes={todayMinutes}
              onClaimReward={handleClaimReward}
            />
          </div>
        </section>
      </FeedWrapper>

      <StickyWrapper>
        <div className="rounded-[24px] border-2 border-sky-100 bg-white p-4 shadow-sm dark:border-[#202f36] dark:bg-[#182226]">
          <UserProgress
            activeCourse={{
              title: activeCourse.title,
              imageSrc: activeCourse.imageSrc,
            }}
            hearts={hearts}
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
          totalLessons={progressSummary.totalLessons}
          completedLessons={progressSummary.completedLessons}
          completionPercent={progressSummary.completionPercent}
          earnedXp={progressSummary.earnedXp}
          totalStudySeconds={totalStudySeconds}
        />
        <UnitProgressList className="hidden xl:block" units={progressUnits} />

        {sidebarCards.map((card) => (
          <div
            key={card.title}
            className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-[#202f36] dark:bg-[#182226]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-50 dark:bg-slate-800">
                <Image src={card.iconSrc} alt="" width={42} height={42} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-700 dark:text-slate-100">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {showAuthCard ? (
          <div className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-[#202f36] dark:bg-[#182226]">
            <h3 className="text-lg font-black text-slate-700 dark:text-slate-100">
              Tạo hồ sơ
            </h3>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
              Lưu tiến độ và phần được mở trên mọi thiết bị.
            </p>
            <div className="mt-5 grid gap-3">
              <Button asChild variant="primary" className="h-12 rounded-2xl">
                <Link href="/sign-up">Tạo hồ sơ</Link>
              </Button>
              <Button
                asChild
                variant="primary-outline"
                className="h-12 rounded-2xl"
              >
                <Link href="/sign-in">Đăng nhập</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </StickyWrapper>
    </div>
  );
};
