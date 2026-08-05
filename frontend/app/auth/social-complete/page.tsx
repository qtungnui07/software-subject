import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { resolveUserAvatar } from "@/constants/user-avatar";
import { sanitizeInternalRedirect } from "@/lib/onboarding/onboarding-redirect";
import { syncClerkUser } from "@/services/auth-service";

type Props = {
  searchParams: Promise<{ mode?: string; redirect?: string }>;
};

export default async function SocialCompletePage({ searchParams }: Props) {
  const params = await searchParams;
  const destination = sanitizeInternalRedirect(params.redirect) || "/onboarding";
  const isSignUp = params.mode === "sign-up";
  const { userId } = await clerkAuth();
  const user = userId ? await currentUser() : null;
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!userId || !user || !email) {
    redirect("/sign-in?error=social_auth_failed");
  }

  const name =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || "User";
  const result = await syncClerkUser({
    clerkUserId: userId,
    name,
    email,
    imageSrc: resolveUserAvatar(user.imageUrl),
    createIfMissing: isSignUp,
  });

  if (!result.ok) {
    if (!isSignUp && result.status === 404) {
      redirect("/sign-in?error=account_not_found");
    }
    redirect(`/sign-in?error=${isSignUp ? "registration_failed" : "social_auth_failed"}`);
  }

  if (isSignUp) {
    redirect(destination);
  }

  redirect(`/auth/login-success?redirect=${encodeURIComponent(destination)}`);
}
