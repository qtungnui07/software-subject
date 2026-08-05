import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CheckpointClient } from "@/components/checkpoint/checkpoint-client";
import { getLearningNodeById } from "@/lib/courses/course-catalog";
import { canAttemptCheckpoint } from "@/lib/courses/course-unlock-policy";
import { getCourseProgressForUser } from "@/services/course-progress-service";
import {
  getContentCheckpoint,
  getContentCourse,
} from "@/services/content-service";
import type { CheckpointPageData } from "@/types/checkpoint";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ checkpointId: string }>;
};

export default async function CheckpointPage({ params }: Props) {
  const { checkpointId } = await params;
  const [course, checkpointContent] = await Promise.all([
    getContentCourse("english"),
    getContentCheckpoint(checkpointId).catch(() => null),
  ]);
  if (!checkpointContent) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect(
      `/sign-in?redirect=${encodeURIComponent(`/checkpoint/${checkpointId}`)}`,
    );
  }

  const node = getLearningNodeById(course, checkpointId);
  if (!node || node.type !== "checkpoint") notFound();

  const progress = await getCourseProgressForUser(userId, "english");
  if (!canAttemptCheckpoint(progress, checkpointId, course)) {
    redirect("/learn?checkpoint=locked");
  }

  const checkpointSection = course.sections.find((section) =>
    section.chapter.nodes.some((candidate) => candidate.id === checkpointId),
  );
  const nextSection = checkpointSection
    ? course.sections.find(
        (section) => section.order === checkpointSection.order + 1,
      )
    : null;

  const data: CheckpointPageData = {
    checkpointId,
    title: checkpointContent.title,
    description: checkpointContent.description,
    passThreshold: checkpointContent.passThreshold,
    estimatedMinutes: checkpointContent.estimatedMinutes,
    exercises: checkpointContent.exercises,
    bestScore: progress.checkpointScores[checkpointId] ?? null,
    sectionTwoUnlocked: nextSection
      ? progress.unlockedSectionIds.includes(nextSection.id)
      : false,
    userId,
  };

  return <CheckpointClient data={data} />;
}
