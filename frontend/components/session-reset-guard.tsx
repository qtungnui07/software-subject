"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

const SESSION_RESET_VERSION = "release-clean-slate-2026-07-02";
const SESSION_RESET_MARKER_KEY = "robogo-session-reset-version";

const clearAppCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const cookieName = cookie.split("=")[0]?.trim();

    if (!cookieName) return;

    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
};

const clearBrowserStorage = () => {
  try {
    window.localStorage.clear();
  } catch {
    // Storage may be unavailable in restricted browser modes.
  }

  try {
    window.sessionStorage.clear();
  } catch {
    // Storage may be unavailable in restricted browser modes.
  }
};

export const SessionResetGuard = () => {
  const { signOut } = useClerk();

  useEffect(() => {
    const currentMarker = window.localStorage.getItem(SESSION_RESET_MARKER_KEY);

    if (currentMarker === SESSION_RESET_VERSION) {
      return;
    }

    const resetSession = async () => {
      clearBrowserStorage();
      clearAppCookies();

      try {
        await fetch("/api/auth/local/sign-out", { method: "POST" });
      } catch (error) {
        console.warn("Could not clear local session:", error);
      }

      try {
        await signOut();
      } catch (error) {
        console.warn("Could not clear Clerk session:", error);
      }

      window.localStorage.setItem(SESSION_RESET_MARKER_KEY, SESSION_RESET_VERSION);

      if (window.location.pathname !== "/") {
        window.location.replace("/");
      } else {
        window.location.reload();
      }
    };

    void resetSession();
  }, [signOut]);

  return null;
};
