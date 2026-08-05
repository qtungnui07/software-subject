import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { CourseLessonDetail } from "@/components/lesson/course-lesson-detail";
import { getUserProgress } from "@/db/queries";
import { getLearningNodeById } from "@/lib/courses/course-catalog";
import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import { buildLessonDetailViewModel } from "@/lib/courses/lesson-detail-view-model";
import { getCourseProgressForUser } from "@/services/course-progress-service";
import {
  getContentCourse,
  getContentNode,
} from "@/services/content-service";

type Props = {
  params: Promise<{
    lessonId: string;
  }>;
};

const LessonDetailPage = async ({ params }: Props) => {
  const { lessonId } = await params;
  const course = await getContentCourse("english");
  const node = getLearningNodeById(course, lessonId);

  if (!node || node.type === "chest") {
    notFound();
  }
  const nodeId = node.id;

  const [session, userProgressData, contentNode] = await Promise.all([
    auth(),
    getUserProgress().catch((error) => {
      console.error("Failed to load user progress:", error);
      return null;
    }),
    getContentNode(nodeId),
  ]);

  const courseProgress = session?.user?.id
    ? await getCourseProgressForUser(session.user.id).catch((error) => {
        console.error("Failed to load course progress:", error);
        return createDefaultCourseProgress(course);
      })
    : createDefaultCourseProgress(course);
  const detail = buildLessonDetailViewModel(
    node.id,
    courseProgress,
    course,
    contentNode,
  );

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
