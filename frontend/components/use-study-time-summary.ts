"use client";

import { useEffect, useState } from "react";

type StudyTimeEvent = CustomEvent<{ todaySeconds: number }>;

const STUDY_TIME_EVENT = "robogo:study-time";

export const dispatchStudyTimeUpdate = (todaySeconds: number) => {
  window.dispatchEvent(
    new CustomEvent(STUDY_TIME_EVENT, { detail: { todaySeconds } })
  );
};

export const useStudyTimeMinutes = (isLoggedIn: boolean) => {
  const [todaySeconds, setTodaySeconds] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    const loadStudyTime = async () => {
      try {
        const response = await fetch("/api/study-time", { cache: "no-store" });
        const data = await response.json().catch(() => null);

        if (isMounted && response.ok && data?.summary) {
          setTodaySeconds(Number(data.summary.todaySeconds || 0));
        }
      } catch (error) {
        console.warn("Failed to load study time", error);
      }
    };

    const handleStudyTimeUpdate = (event: Event) => {
      const studyTimeEvent = event as StudyTimeEvent;
      setTodaySeconds(Number(studyTimeEvent.detail?.todaySeconds || 0));
    };

    void loadStudyTime();
    window.addEventListener(STUDY_TIME_EVENT, handleStudyTimeUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(STUDY_TIME_EVENT, handleStudyTimeUpdate);
    };
  }, [isLoggedIn]);

  return isLoggedIn ? Math.floor(todaySeconds / 60) : 0;
};
