import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Lock,
  MessageCircleMore,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { UserProgress } from "@/components/user-progress";
import { cn } from "@/lib/utils";
import type { LessonDetailViewModel } from "@/types/lesson-detail";

type Props = {
  detail: LessonDetailViewModel;
  activeCourse: {
    title: string;
    imageSrc: string;
  };
  hearts: number;
  points: number;
};

export const CourseLessonDetail = ({
  detail,
  activeCourse,
  hearts,
  points,
}: Props) => {
  const isLocked = detail.status === "locked";
  const isCompleted = detail.status === "completed";
  const isCheckpoint = detail.nodeType === "checkpoint";

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start xl:gap-10 2xl:grid-cols-[minmax(0,1fr)_425px]">
      <FeedWrapper>
        <article
          data-course-lesson-detail={detail.nodeId}
          className="overflow-hidden rounded-[30px] border-2 border-sky-100 bg-white shadow-sm dark:border-[#202f36] dark:bg-[#182226]"
        >
          <div className="bg-[linear-gradient(135deg,#eaf7ff_0%,#f8fcff_54%,#ffffff_100%)] p-6 dark:bg-[linear-gradient(135deg,#183141_0%,#182226_60%,#182226_100%)] md:p-8">
            <Link
              href="/learn"
              className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <ArrowLeft className="size-4 stroke-[3.5] transition group-hover:-translate-x-0.5" />
              Quay lại lộ trình
            </Link>

            <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-start">
              <div
                className={cn(
                  "flex size-20 shrink-0 items-center justify-center rounded-[24px] border-2 shadow-sm",
                  isLocked
                    ? "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-500"
                    : isCheckpoint
                      ? "border-amber-200 bg-amber-50 text-amber-500 dark:border-amber-950/50 dark:bg-amber-950/20 dark:text-amber-400"
                      : isCompleted
                        ? "border-emerald-200 bg-emerald-50 text-emerald-500 dark:border-emerald-950/50 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "border-sky-200 bg-sky-50 text-[#1486CC] dark:border-sky-950/50 dark:bg-sky-950/20 dark:text-sky-400",
                )}
              >
                {isLocked ? (
                  <Lock className="size-10 stroke-[3]" />
                ) : isCheckpoint ? (
                  <Trophy className="size-10 stroke-[3]" />
                ) : isCompleted ? (
                  <CheckCircle2 className="size-10 stroke-[3]" />
                ) : detail.status === "current" ? (
                  <Star className="size-10 stroke-[3]" />
                ) : (
                  <BookOpenCheck className="size-10 stroke-[3]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1486CC] dark:text-sky-300">
                  {detail.section.title} · {detail.chapter.title}
                </p>
                <span
                  className={cn(
                    "mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide",
                    isLocked
                      ? "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400"
                      : isCompleted
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950/50 dark:bg-emerald-950/20 dark:text-emerald-300"
                        : isCheckpoint
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-950/50 dark:bg-amber-950/20 dark:text-amber-300"
                          : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-950/50 dark:bg-sky-950/20 dark:text-sky-300",
                  )}
                >
                  {detail.statusLabel}
                </span>
                <h1 className="mt-3 text-2xl font-black leading-tight text-slate-800 dark:text-slate-100 md:text-4xl">
                  {detail.title}
                </h1>
                <p className="mt-3 max-w-3xl text-base font-bold leading-relaxed text-slate-600 dark:text-slate-300">
                  {detail.overview}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-6 md:p-8">
            <section>
              <div className="flex items-center gap-2">
                <Target className="size-5 stroke-[3] text-[#1486CC]" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Mục tiêu bài học
                </h2>
              </div>
              <ul className="mt-4 space-y-3">
                {detail.objectives.map((objective) => (
                  <li
                    key={objective}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm font-bold leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[#1486CC] dark:bg-sky-950/40 dark:text-sky-300">
                      <Check className="size-3.5 stroke-[4]" />
                    </span>
                    {objective}
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4 dark:border-sky-950/30 dark:bg-sky-950/10">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <Dumbbell className="size-4 stroke-[3]" />
                  Bài tập
                </p>
                <p className="mt-2 text-xl font-black text-[#1486CC] dark:text-sky-300">
                  {detail.exerciseCount} câu
                </p>
              </div>
              <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <Clock3 className="size-4 stroke-[3]" />
                  Ước tính
                </p>
                <p className="mt-2 text-xl font-black text-slate-700 dark:text-slate-200">
                  {detail.estimatedMinutes} phút
                </p>
              </div>
              <div className="rounded-2xl border-2 border-violet-100 bg-violet-50/60 p-4 dark:border-violet-950/30 dark:bg-violet-950/10">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <Sparkles className="size-4 stroke-[3]" />
                  Phần thưởng
                </p>
                <p className="mt-2 text-xl font-black text-violet-600 dark:text-violet-300">
                  {detail.xp} XP
                </p>
              </div>
              <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-950/30 dark:bg-emerald-950/10">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <MessageCircleMore className="size-4 stroke-[3]" />
                  Dạng bài
                </p>
                <p className="mt-2 text-xl font-black text-emerald-600 dark:text-emerald-300">
                  {detail.exerciseTypes.length} dạng
                </p>
              </div>
            </section>

            <section className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[24px] border-2 border-slate-100 p-5 dark:border-slate-800">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Kỹ năng trọng tâm
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {detail.focusSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700 dark:border-sky-950/50 dark:bg-sky-950/20 dark:text-sky-300"
                    >
                      {skill.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border-2 border-slate-100 p-5 dark:border-slate-800">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Dạng bài sẽ gặp
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {detail.exerciseTypes.map((exerciseType) => (
                    <span
                      key={exerciseType.id}
                      className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700 dark:border-violet-950/50 dark:bg-violet-950/20 dark:text-violet-300"
                    >
                      {exerciseType.label}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {detail.checkpoint ? (
              <section className="rounded-[24px] border-2 border-amber-200 bg-amber-50/70 p-5 dark:border-amber-950/50 dark:bg-amber-950/15">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Trophy className="size-5 stroke-[3]" />
                  <h2 className="text-sm font-black uppercase tracking-wider">
                    Thông tin checkpoint
                  </h2>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Điểm yêu cầu
                    </p>
                    <p className="mt-1 text-xl font-black text-amber-700 dark:text-amber-300">
                      {detail.checkpoint.passingScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Điểm cao nhất
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-700 dark:text-slate-200">
                      {detail.checkpoint.bestScore === null
                        ? "Chưa có"
                        : `${detail.checkpoint.bestScore}%`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Mở khóa
                    </p>
                    <p className="mt-1 text-sm font-black leading-snug text-slate-700 dark:text-slate-200">
                      {detail.checkpoint.unlocksLabel ?? "Nội dung tiếp theo"}
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            <section
              className={cn(
                "rounded-[24px] border-2 p-5",
                isLocked
                  ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30"
                  : "border-sky-100 bg-sky-50/50 dark:border-sky-950/30 dark:bg-sky-950/10",
              )}
            >
              <p className="text-sm font-bold leading-relaxed text-slate-600 dark:text-slate-300">
                {detail.statusDescription}
              </p>
              {detail.lockedReason ? (
                <p className="mt-2 flex items-start gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                  <Lock className="mt-0.5 size-4 shrink-0 stroke-[3]" />
                  {detail.lockedReason}
                </p>
              ) : null}

              <div className="mt-5">
                {detail.playerHref ? (
                  <Button asChild variant="lessonPrimary" className="h-12 w-full rounded-2xl">
                    <Link href={detail.playerHref}>{detail.actionLabel}</Link>
                  </Button>
                ) : (
                  <Button disabled variant="lessonPrimary" className="h-12 w-full rounded-2xl">
                    {detail.actionLabel}
                  </Button>
                )}
              </div>
            </section>
          </div>
        </article>
      </FeedWrapper>

      <StickyWrapper>
        <div className="rounded-[24px] border-2 border-sky-100 bg-white p-4 shadow-sm dark:border-[#202f36] dark:bg-[#182226]">
          <UserProgress
            activeCourse={activeCourse}
            hearts={hearts}
            points={points}
          />
        </div>
      </StickyWrapper>
    </div>
  );
};
