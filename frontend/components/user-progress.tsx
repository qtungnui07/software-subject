import Image from "next/image";
import Link from "next/link";
import { StreakWidget } from "@/components/streak/streak-widget";

type Props = {
  activeCourse: { imageSrc: string; title: string };
  hearts: number;
  points?: number;
};

export const UserProgress = ({
  activeCourse,
  hearts,
}: Props) => {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <Link
        href="/courses"
        className="group flex h-14 flex-1 items-center justify-between rounded-[18px] border-2 border-transparent bg-white dark:bg-[#141f23] px-3.5 transition hover:border-[#d6ecfb] hover:bg-[#f4fbff] dark:hover:border-[#202f36] dark:hover:bg-[#1f2d33]/50"
        aria-label={`Đổi khóa học ${activeCourse.title}`}
      >
        <div className="flex items-center gap-x-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 shadow-sm ring-2 ring-slate-100 dark:ring-slate-700 transition group-hover:ring-sky-100 dark:group-hover:ring-sky-950">
            <Image
              src={activeCourse.imageSrc}
              alt={activeCourse.title}
              className="rounded-md"
              width={22}
              height={22}
            />
          </span>
          <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 transition">
            {activeCourse.title}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-600 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition ml-2">
          ▼
        </span>
      </Link>

      <div className="flex items-center gap-x-1.5 shrink-0">
        <StreakWidget className="h-14 rounded-[18px]" />

        <div
          className="flex h-14 items-center gap-x-1.5 rounded-[18px] border-2 border-rose-100 dark:border-rose-950/40 bg-rose-50 dark:bg-rose-950/20 px-2.5 text-sm font-black text-rose-500 dark:text-rose-400 shadow-sm"
          aria-label="Số tim còn lại"
        >
          <Image src="/heart.svg" height={22} width={22} alt="Tim" />
          <span>{hearts}</span>
        </div>
      </div>
    </div>
  );
};
