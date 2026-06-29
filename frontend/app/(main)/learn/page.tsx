import { redirect } from "next/navigation";

import { ChapterOneLearnClient } from "@/components/chapter-one-learn-client";
import { chapterOneDemoScope } from "@/constants/lessons";
import { getUserProgress } from "@/db/queries";
import { auth } from "@/auth";

const LearnPage = async () => {
  const session = await auth();
  const userProgressData = await getUserProgress();

  if (!userProgressData || !userProgressData.activeCourseId) {
    redirect("/courses");
  }

  const activeCourse = userProgressData.activeCourse || {
    title: chapterOneDemoScope.courseTitle,
    imageSrc: "/globe.svg",
  };

  return (
    <ChapterOneLearnClient
      activeCourse={{ title: activeCourse.title, imageSrc: activeCourse.imageSrc }}
      hearts={userProgressData.hearts}
      points={userProgressData.points}
      showAuthCard={!session?.user}
    />
  );
};

export default LearnPage;
