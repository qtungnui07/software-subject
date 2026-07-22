import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CourseLearnClient } from "@/components/learn/course-learn-client";
import { chapterOneDemoScope } from "@/constants/lessons";
import { englishCourse } from "@/data/courses/english-course";
import { getUserProgress } from "@/db/queries";
import { getInitialChapterOneProgress } from "@/lib/chapter-one-progress";
import { projectCourseProgressToChapterOne } from "@/lib/courses/chapter-one-adapter";
import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import { getCourseProgressForUser } from "@/services/course-progress-service";
import { getOnboardingStateForUser } from "@/services/onboarding-service";
import { getStudyTime, type StudyTimeSummary } from "@/services/study-time-service";

type LearnPageProps = {
  searchParams?: Promise<{ section?: string; locked?: string }>;
};

const LearnPage = async ({ searchParams }: LearnPageProps) => {
  const session = await auth();

  if (session?.user?.id) {
    const onboarding = await getOnboardingStateForUser(session.user.id);
    if (onboarding.status !== "completed") {
      redirect("/onboarding");
    }
  }

  const userProgressData = await getUserProgress();

  if (!userProgressData || !userProgressData.activeCourseId) {
    redirect("/courses");
  }

  const activeCourse = userProgressData.activeCourse || {
    title: chapterOneDemoScope.courseTitle,
    imageSrc: "/globe.svg",
  };
  let studyTimeSummary: StudyTimeSummary | null = null;
  let legacyProgress = getInitialChapterOneProgress();
  let courseProgress = createDefaultCourseProgress("english");

  if (session?.user?.id) {
    const [studyResult, courseResult] = await Promise.all([
      getStudyTime(session.user.id).catch(() => null),
      getCourseProgressForUser(session.user.id).catch(() =>
        createDefaultCourseProgress("english")
      ),
    ]);

    studyTimeSummary = studyResult?.ok ? studyResult.data.summary : null;
    courseProgress = courseResult;
    legacyProgress = projectCourseProgressToChapterOne(courseProgress);
  }

  const params = (await searchParams) ?? {};
  const requestedSectionId = params.section ?? params.locked;

  if (requestedSectionId) {
    const requestedSectionExists = englishCourse.sections.some(
      (section) => section.id === requestedSectionId,
    );
    redirect(
      requestedSectionExists
        ? `/sections?requested=${encodeURIComponent(requestedSectionId)}`
        : "/sections",
    );
  }

  return (
    <CourseLearnClient
      activeCourse={{ title: activeCourse.title, imageSrc: activeCourse.imageSrc }}
      hearts={userProgressData.hearts}
      points={userProgressData.points}
      showAuthCard={!session?.user}
      initialStudyTimeSummary={studyTimeSummary}
      progressOwnerId={session?.user?.id ?? null}
      initialLegacyProgressState={legacyProgress}
      initialCourseProgressState={courseProgress}
    />
  );
};

export default LearnPage;
