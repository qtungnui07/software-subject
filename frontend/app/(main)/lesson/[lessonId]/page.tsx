import { notFound } from "next/navigation";

import { ChapterOneLessonDetailClient } from "@/components/chapter-one-lesson-detail-client";
import { lessonNodes } from "@/constants/lessons";
import { getUserProgress } from "@/db/queries";
import { auth } from "@/auth";
import { getChapterOneProgressForUser } from "@/services/chapter-one-progress-service";
import { getInitialChapterOneProgress } from "@/lib/chapter-one-progress";

type Props = {
  params: Promise<{
    lessonId: string;
  }>;
};

const LessonDetailPage = async ({ params }: Props) => {
  const { lessonId } = await params;
  const legacyId = Number.parseInt(lessonId, 10);
  const lesson =
    lessonNodes.find((node) => node.nodeId === lessonId) ||
    lessonNodes.find((node) => node.id === legacyId);

  if (!lesson) {
    notFound();
  }

  let userProgressData = null;
  const session = await auth();
  try {
    userProgressData = await getUserProgress();
  } catch (error) {
    console.error("Failed to load user progress:", error);
  }

  const activeCourse = userProgressData?.activeCourse || {
    title: "Tiếng Anh",
    imageSrc: "/globe.svg",
  };
  const chapterOneProgress = session?.user?.id
    ? await getChapterOneProgressForUser(session.user.id).catch((error) => {
        console.error("Failed to load Chapter 1 progress", error);
        return getInitialChapterOneProgress();
      })
    : getInitialChapterOneProgress();

  return (
    <ChapterOneLessonDetailClient
      lessonNodeId={lesson.nodeId}
      activeCourse={{ title: activeCourse.title, imageSrc: activeCourse.imageSrc }}
      hearts={userProgressData?.hearts ?? 5}
      points={userProgressData?.points ?? 100}
      progressOwnerId={session?.user?.id ?? null}
      initialProgressState={chapterOneProgress}
    />
  );
};

export default LessonDetailPage;
