import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CheckpointClient } from "@/components/checkpoint/checkpoint-client";
import {
  SECTION_ONE_CHECKPOINT_ESTIMATED_MINUTES,
  SECTION_ONE_CHECKPOINT_ID,
  SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
  sectionOneCheckpointExercises,
} from "@/data/exercises/english/section-1/checkpoint";
import { toPublicCheckpointExercises } from "@/lib/checkpoints/checkpoint-public";
import { getLearningNodeById } from "@/lib/courses/course-catalog";
import { canAttemptCheckpoint } from "@/lib/courses/course-unlock-policy";
import { getCourseProgressForUser } from "@/services/course-progress-service";
import type { CheckpointPageData } from "@/types/checkpoint";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ checkpointId: string }>;
};

export default async function CheckpointPage({ params }: Props) {
  const { checkpointId } = await params;
  if (checkpointId !== SECTION_ONE_CHECKPOINT_ID) notFound();

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect(
      `/sign-in?redirect=${encodeURIComponent(`/checkpoint/${checkpointId}`)}`,
    );
  }

  const node = getLearningNodeById(checkpointId);
  if (!node || node.type !== "checkpoint") notFound();

  const progress = await getCourseProgressForUser(userId, "english");
  if (!canAttemptCheckpoint(progress, checkpointId)) {
    redirect("/learn?checkpoint=locked");
  }

  const data: CheckpointPageData = {
    checkpointId,
    title: node.title,
    description: node.description,
    passThreshold: SECTION_ONE_CHECKPOINT_PASS_THRESHOLD,
    estimatedMinutes: SECTION_ONE_CHECKPOINT_ESTIMATED_MINUTES,
    exercises: toPublicCheckpointExercises(sectionOneCheckpointExercises),
    bestScore: progress.checkpointScores[checkpointId] ?? null,
    sectionTwoUnlocked: progress.unlockedSectionIds.includes(
      "english-section-2",
    ),
    userId,
  };

  return <CheckpointClient data={data} />;
}
