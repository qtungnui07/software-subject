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
import { getPlacementTestResultForUser } from "@/services/placement-test-service";
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
  let recommendedSectionId: "english-section-1" | "english-section-2" | "english-section-3" | null = null;

  if (session?.user?.id) {
    const [studyResult, courseResult, placementResult] = await Promise.all([
      getStudyTime(session.user.id).catch(() => null),
      getCourseProgressForUser(session.user.id).catch(() =>
        createDefaultCourseProgress("english")
      ),
      getPlacementTestResultForUser(session.user.id).catch(() => null),
    ]);

    studyTimeSummary = studyResult?.ok ? studyResult.data.summary : null;
    courseProgress = courseResult;
    legacyProgress = projectCourseProgressToChapterOne(courseProgress);
    recommendedSectionId = placementResult?.highestAssignedSectionId ?? null;
  }

  const params = (await searchParams) ?? {};
  const requestedSectionId = params.section ?? params.locked;
  const requestedSectionExists = englishCourse.sections.some(
    (section) => section.id === requestedSectionId
  );
  const initialSelectedSectionId = requestedSectionExists
    ? requestedSectionId!
    : courseProgress.currentSectionId;

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
      initialSelectedSectionId={initialSelectedSectionId}
      recommendedSectionId={recommendedSectionId}
    />
  );
};

export default LearnPage;
