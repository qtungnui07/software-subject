import type { OnboardingStatus } from "@/types/onboarding";

const CONTROL_OR_BACKSLASH_PATTERN = /[\u0000-\u001F\u007F\\]/;

export const sanitizeInternalRedirect = (
  value: string | null | undefined,
): string | null => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  if (CONTROL_OR_BACKSLASH_PATTERN.test(value)) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(value);
    if (
      !decoded.startsWith("/") ||
      decoded.startsWith("//") ||
      CONTROL_OR_BACKSLASH_PATTERN.test(decoded)
    ) {
      return null;
    }

    const baseUrl = new URL("https://robogo.local");
    const resolved = new URL(value, baseUrl);
    if (resolved.origin !== baseUrl.origin) {
      return null;
    }

    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return null;
  }
};

export const getDefaultPostAuthDestination = (
  requestedRedirect: string | null | undefined,
) => {
  const safeRedirect = sanitizeInternalRedirect(requestedRedirect);

  if (
    !safeRedirect ||
    safeRedirect === "/learn" ||
    safeRedirect.startsWith("/learn?")
  ) {
    return "/onboarding";
  }

  return safeRedirect;
};

export const getLearnGateRedirect = (status: OnboardingStatus) =>
  status === "completed" ? null : "/onboarding";

export const getOnboardingPageRedirect = (status: OnboardingStatus) =>
  status === "completed" ? "/learn" : null;
