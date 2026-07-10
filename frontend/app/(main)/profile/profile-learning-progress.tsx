"use client";

import { useEffect, useState } from "react";

import {
  getChapterOneProgress,
  getChapterOneProgressSummary,
  subscribeChapterOneProgress,
  type ChapterOneProgressSummary,
} from "@/lib/chapter-one-progress";

type Props = {
  variant: "lessons" | "lessonsWithLabel" | "percent";
};

const readProgressSummary = (): ChapterOneProgressSummary =>
  getChapterOneProgressSummary(getChapterOneProgress());

export const ProfileLearningProgress = ({ variant }: Props) => {
  const [summary, setSummary] = useState<ChapterOneProgressSummary>(() =>
    getChapterOneProgressSummary()
  );

  useEffect(() => {
    const refreshProgress = () => {
      const nextSummary = readProgressSummary();
      setSummary(nextSummary);
      document.documentElement.style.setProperty(
        "--profile-course-progress-percent",
        `${nextSummary.percent}%`
      );
    };

    refreshProgress();
    return subscribeChapterOneProgress(refreshProgress);
  }, []);

  if (variant === "percent") {
    return <>{summary.percent}%</>;
  }

  if (variant === "lessonsWithLabel") {
    return (
      <>
        {summary.completedMainNodes} / {summary.totalMainNodes} bài học đã hoàn thành
      </>
    );
  }

  return (
    <>
      {summary.completedMainNodes} / {summary.totalMainNodes}
    </>
  );
};
