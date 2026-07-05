import { redirect } from "next/navigation";

import { ChapterOneLearnClient } from "@/components/chapter-one-learn-client";
import { chapterOneDemoScope } from "@/constants/lessons";
import { getUserProgress } from "@/db/queries";
import { auth } from "@/auth";
import { getStudyTime, type StudyTimeSummary } from "@/services/study-time-service";
import { getChapterOneProgressForUser } from "@/services/chapter-one-progress-service";
import { getInitialChapterOneProgress } from "@/lib/chapter-one-progress";

const LearnPage = async () => {
  const session = await auth();
  const userProgressData = await getUserProgress();

  if (!userProgressData || !userProgressData.activeCourseId) {
    redirect("/courses");
  }

  const activeCourse = userProgressData.activeCourse || {
    title: chapterOneDemoScope.courseTitle,
    imageSrc: "/globe.svg",
  };
  let studyTimeSummary: StudyTimeSummary | null = null;
  let chapterOneProgress = getInitialChapterOneProgress();

  if (session?.user?.id) {
    const result = await getStudyTime(session.user.id).catch((error) => {
      console.error("Failed to load study time summary", error);
      return null;
    });

    studyTimeSummary = result?.ok ? result.data.summary : null;
    chapterOneProgress = await getChapterOneProgressForUser(session.user.id).catch((error) => {
      console.error("Failed to load Chapter 1 progress", error);
      return getInitialChapterOneProgress();
    });
  }

  return (
    <ChapterOneLearnClient
      activeCourse={{ title: activeCourse.title, imageSrc: activeCourse.imageSrc }}
      hearts={userProgressData.hearts}
      points={userProgressData.points}
      showAuthCard={!session?.user}
      initialStudyTimeSummary={studyTimeSummary}
      progressOwnerId={session?.user?.id ?? null}
      initialProgressState={chapterOneProgress}
    />
  );
};

export default LearnPage;
