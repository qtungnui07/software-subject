"use client";

import { useEffect, useState } from "react";

import { getWholeStudyMinutes, normalizeStudySeconds } from "@/lib/study-time/study-time-format";

export type StudyTimeUpdate = {
  todaySeconds: number;
  totalSeconds: number;
};

type StudyTimeEvent = CustomEvent<StudyTimeUpdate>;

const STUDY_TIME_EVENT = "robogo:study-time";

const normalizeStudyTimeUpdate = (value: Partial<StudyTimeUpdate>) => ({
  todaySeconds: normalizeStudySeconds(value.todaySeconds),
  totalSeconds: normalizeStudySeconds(value.totalSeconds),
});

export const dispatchStudyTimeUpdate = (summary: StudyTimeUpdate) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<StudyTimeUpdate>(STUDY_TIME_EVENT, {
      detail: normalizeStudyTimeUpdate(summary),
    }),
  );
};

export const useStudyTimeSummary = (isLoggedIn: boolean) => {
  const [summary, setSummary] = useState<StudyTimeUpdate>({
    todaySeconds: 0,
    totalSeconds: 0,
  });

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
          setSummary(normalizeStudyTimeUpdate(data.summary));
        }
      } catch (error) {
        console.warn("Failed to load study time", error);
      }
    };

    const handleStudyTimeUpdate = (event: Event) => {
      const studyTimeEvent = event as StudyTimeEvent;
      setSummary(normalizeStudyTimeUpdate(studyTimeEvent.detail ?? {}));
    };

    void loadStudyTime();
    window.addEventListener(STUDY_TIME_EVENT, handleStudyTimeUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(STUDY_TIME_EVENT, handleStudyTimeUpdate);
    };
  }, [isLoggedIn]);

  return isLoggedIn
    ? summary
    : { todaySeconds: 0, totalSeconds: 0 };
};

export const useStudyTimeMinutes = (isLoggedIn: boolean) => {
  const summary = useStudyTimeSummary(isLoggedIn);
  return isLoggedIn ? getWholeStudyMinutes(summary.todaySeconds) : 0;
};
