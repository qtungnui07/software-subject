import Image from "next/image";
import Link from "next/link";
import { StreakWidget } from "@/components/streak/streak-widget";

type Props = {
  activeCourse: { imageSrc: string; title: string };
  hearts: number;
  points: number;
};

export const UserProgress = ({
  activeCourse,
  points,
  hearts,
}: Props) => {
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

      <StreakWidget className="h-14 rounded-[18px]" />

      <div
        className="flex h-14 items-center gap-x-2 rounded-[18px] border-2 border-rose-100 dark:border-rose-950/40 bg-rose-50 dark:bg-rose-950/20 px-3 text-sm font-black text-rose-500 dark:text-rose-400 shadow-sm"
        aria-label="Số tim còn lại"
      >
        <Image src="/heart.svg" height={25} width={25} alt="Tim" />
        <span>{hearts}</span>
      </div>

    </div>
  );
};
