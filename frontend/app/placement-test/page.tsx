import { auth } from "@/auth";
import PlacementTestClient from "@/app/placement-test/placement-test-client";
import { toPlacementResultResponse } from "@/lib/placement-test/placement-api-contract";
import { getPlacementTestResultForUser } from "@/services/placement-test-service";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ start?: string; from?: string }>;
};

export default async function PlacementTestPage({ searchParams }: Props) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const previous = userId ? await getPlacementTestResultForUser(userId) : null;
  const params = await searchParams;

  return (
    <PlacementTestClient
      isAuthenticated={Boolean(userId)}
      userKey={userId}
      initialPreviousResult={
        previous ? toPlacementResultResponse(previous).result : null
      }
      autoStart={params.start === "1"}
      fromOnboarding={params.from === "onboarding"}
    />
  );
}
