"use client";

import { useEffect } from "react";

const PRESENCE_PING_MS = 25_000;

const sendPresence = (active: boolean, keepalive = false) => {
  return fetch("/api/presence", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ active }),
    cache: "no-store",
    keepalive,
  }).catch(() => {
    // Presence is best-effort; TTL will mark users off if a final ping is lost.
  });
};

export const PresenceReporter = () => {
  useEffect(() => {
    void sendPresence(true);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void sendPresence(true);
      }
    }, PRESENCE_PING_MS);

    const handleVisibilityChange = () => {
      void sendPresence(document.visibilityState === "visible", true);
    };

    const handlePageHide = () => {
      void sendPresence(false, true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      void sendPresence(false, true);
    };
  }, []);

  return null;
};
