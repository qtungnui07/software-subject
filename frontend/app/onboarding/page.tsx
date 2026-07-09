import { redirect } from "next/navigation";

import { auth } from "@/auth";
import OnboardingClient from "@/app/onboarding/onboarding-client";
import { getOnboardingPageRedirect } from "@/lib/onboarding/onboarding-redirect";
import { getOnboardingStateForUser } from "@/services/onboarding-service";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/sign-in?redirect=%2Fonboarding");
  }

  const state = await getOnboardingStateForUser(userId);
  const completedRedirect = getOnboardingPageRedirect(state.status);

  if (completedRedirect) {
    redirect(completedRedirect);
  }

  return <OnboardingClient userId={userId} initialState={state} />;
}
