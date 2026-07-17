import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SectionsClient } from "@/app/(main)/sections/sections-client";
import { getUserProgress } from "@/db/queries";
import { createDefaultCourseProgress } from "@/lib/courses/course-progress";
import { buildSectionsPageViewModels } from "@/lib/courses/sections-page-view-model";
import { getCourseProgressForUser } from "@/services/course-progress-service";
import { getOnboardingStateForUser } from "@/services/onboarding-service";
import { getPlacementTestResultForUser } from "@/services/placement-test-service";

export const dynamic = "force-dynamic";

type SectionsPageProps = {
  searchParams?: Promise<{ requested?: string }>;
};

export default async function SectionsPage({ searchParams }: SectionsPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in?redirect=%2Fsections");
  }

  const [onboarding, userProgress] = await Promise.all([
    getOnboardingStateForUser(userId),
    getUserProgress(),
  ]);
  if (onboarding.status !== "completed") {
    redirect("/onboarding");
  }

  if (!userProgress?.activeCourseId) {
    redirect("/courses");
  }

  const [progress, placementResult] = await Promise.all([
    getCourseProgressForUser(userId).catch(() =>
      createDefaultCourseProgress("english"),
    ),
    getPlacementTestResultForUser(userId).catch(() => null),
  ]);
  const sections = buildSectionsPageViewModels(
    progress,
    placementResult?.highestAssignedSectionId ?? null,
  );
  const requestedSectionId = (await searchParams)?.requested;
  const validRequestedSectionId = sections.some(
    (section) => section.id === requestedSectionId,
  )
    ? requestedSectionId ?? null
    : null;

  return (
    <SectionsClient
      sections={sections}
      requestedSectionId={validRequestedSectionId}
    />
  );
}
