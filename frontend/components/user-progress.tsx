import Image from "next/image";
import Link from "next/link";

import { getStudyTier } from "@/lib/study-tier";
import { cn } from "@/lib/utils";

type Props = {
  activeCourse: { imageSrc: string; title: string };
  hearts: number;
  points: number;
  todayMinutes: number;
};

const tierStyles = {
  none: "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-[#202f36] dark:bg-[#141f23] dark:text-slate-400 dark:hover:bg-[#1f2d33]",
  bronze: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-950/40 dark:bg-orange-950/20 dark:text-orange-400 dark:hover:bg-orange-950/30",
  silver: "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-[#202f36] dark:bg-[#141f23] dark:text-slate-300 dark:hover:bg-[#1f2d33]",
  gold: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-950/40 dark:bg-amber-950/20 dark:text-amber-400 dark:hover:bg-amber-950/30",
};

export const UserProgress = ({
  activeCourse,
  points,
  hearts,
  todayMinutes,
}: Props) => {
  const studyTier = getStudyTier(todayMinutes);

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <Link
        href="/courses"
        className="group flex h-14 min-w-0 flex-1 items-center gap-x-2 rounded-[18px] border-2 border-transparent bg-white dark:bg-[#141f23] px-2 transition hover:border-[#d6ecfb] dark:hover:border-[#202f36] hover:bg-[#f4fbff] dark:hover:bg-[#1f2d33]/50"
        aria-label="Đổi khóa học"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-sm ring-2 ring-slate-100 dark:ring-slate-700 transition group-hover:ring-sky-100 dark:group-hover:ring-sky-950">
          <Image
            src={activeCourse.imageSrc}
            alt={activeCourse.title}
            className="rounded-md"
            width={26}
            height={26}
          />
        </span>
        <span className="truncate text-sm font-black text-slate-700 dark:text-slate-200">
          {activeCourse.title}
        </span>
      </Link>

      <Link
        href="/learn"
        className={cn(
          "flex h-14 items-center gap-x-2 rounded-[18px] border-2 px-3 text-sm font-black shadow-sm transition",
          tierStyles[studyTier.tone],
        )}
        aria-label={`Thời gian học hôm nay: ${todayMinutes} phút, ${studyTier.label}`}
        title={studyTier.label}
      >
        <span className="text-xl leading-none" aria-hidden="true">
          {studyTier.icon}
        </span>
        <span className="leading-none">
          {todayMinutes}m
          <span className="mt-1 hidden text-[10px] uppercase tracking-wide opacity-70 2xl:block">
            {studyTier.shortLabel}
          </span>
        </span>
      </Link>

      <Link
        href="/shop"
        className="flex h-14 items-center gap-x-2 rounded-[18px] border-2 border-orange-100 bg-orange-50 px-3 text-sm font-black text-orange-600 shadow-sm transition hover:bg-orange-100 dark:border-orange-950/40 dark:bg-orange-950/20 dark:text-orange-400 dark:hover:bg-orange-950/30"
        aria-label="Kinh nghiệm hiện tại"
      >
        <Image src="/points.svg" height={26} width={26} alt="XP" />
        <span>{points}</span>
      </Link>

      <Link
        href="/shop"
        className="flex h-14 items-center gap-x-2 rounded-[18px] border-2 border-rose-100 bg-rose-50 px-3 text-sm font-black text-rose-500 shadow-sm transition hover:bg-rose-100 dark:border-rose-950/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/30"
        aria-label="Số tim còn lại"
      >
        <Image src="/heart.svg" height={25} width={25} alt="Tim" />
        <span>{hearts}</span>
      </Link>
    </div>
  );
};
