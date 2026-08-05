import { sanitizeInternalRedirect } from "@/lib/onboarding/onboarding-redirect";
import { LoginSuccessClient } from "./login-success-client";

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const destination = sanitizeInternalRedirect(params.redirect) || "/onboarding";

  return <LoginSuccessClient destination={destination} />;
}
