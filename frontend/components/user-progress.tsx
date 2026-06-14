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
  none: "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100",
  bronze: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
  silver: "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
  gold: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
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
        className="group flex h-14 min-w-0 flex-1 items-center gap-x-2 rounded-[18px] border-2 border-transparent bg-white px-2 transition hover:border-[#d6ecfb] hover:bg-[#f4fbff]"
        aria-label="Đổi khóa học"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 shadow-sm ring-2 ring-slate-100 transition group-hover:ring-sky-100">
          <Image
            src={activeCourse.imageSrc}
            alt={activeCourse.title}
            className="rounded-md"
            width={26}
            height={26}
          />
        </span>
        <span className="truncate text-sm font-black text-slate-700">
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
        className="flex h-14 items-center gap-x-2 rounded-[18px] border-2 border-orange-100 bg-orange-50 px-3 text-sm font-black text-orange-600 shadow-sm transition hover:bg-orange-100"
        aria-label="Kinh nghiệm hiện tại"
      >
        <Image src="/points.svg" height={26} width={26} alt="XP" />
        <span>{points}</span>
      </Link>

      <Link
        href="/shop"
        className="flex h-14 items-center gap-x-2 rounded-[18px] border-2 border-rose-100 bg-rose-50 px-3 text-sm font-black text-rose-500 shadow-sm transition hover:bg-rose-100"
        aria-label="Số tim còn lại"
      >
        <Image src="/heart.svg" height={25} width={25} alt="Tim" />
        <span>{hearts}</span>
      </Link>
    </div>
  );
};
