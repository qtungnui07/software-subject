import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { CourseLessonDetail } from "@/components/lesson/course-lesson-detail";
import { lessonNodes } from "@/constants/lessons";
import { getUserProgress } from "@/db/queries";
import { getLearningNodeById } from "@/lib/courses/course-catalog";
import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import { buildLessonDetailViewModel } from "@/lib/courses/lesson-detail-view-model";
import { getCourseProgressForUser } from "@/services/course-progress-service";

type Props = {
  params: Promise<{
    lessonId: string;
  }>;
};

const resolveNodeId = (lessonId: string) => {
  const legacyId = Number.parseInt(lessonId, 10);
  const legacyLesson =
    lessonNodes.find((node) => node.nodeId === lessonId) ??
    lessonNodes.find((node) => node.id === legacyId);

  return legacyLesson?.nodeId ?? lessonId;
};

const LessonDetailPage = async ({ params }: Props) => {
  const { lessonId } = await params;
  const nodeId = resolveNodeId(lessonId);
  const node = getLearningNodeById(nodeId);

  if (!node || node.type === "chest") {
    notFound();
  }

  const [session, userProgressData] = await Promise.all([
    auth(),
    getUserProgress().catch((error) => {
      console.error("Failed to load user progress:", error);
      return null;
    }),
  ]);

  const courseProgress = session?.user?.id
    ? await getCourseProgressForUser(session.user.id).catch((error) => {
        console.error("Failed to load course progress:", error);
        return createDefaultCourseProgress("english");
      })
    : createDefaultCourseProgress("english");
  const detail = buildLessonDetailViewModel(node.id, courseProgress);

  if (!detail) {
    notFound();
  }

  const activeCourse = userProgressData?.activeCourse ?? {
    title: "Tiếng Anh",
    imageSrc: "/globe.svg",
  };

  return (
    <CourseLessonDetail
      detail={detail}
      activeCourse={{
        title: activeCourse.title,
        imageSrc: activeCourse.imageSrc,
      }}
      hearts={userProgressData?.hearts ?? 5}
      points={userProgressData?.points ?? 100}
    />
  );
};

export default LessonDetailPage;
