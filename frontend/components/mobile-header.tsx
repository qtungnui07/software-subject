import Image from "next/image";
import Link from "next/link";

import { getStudyTier } from "@/lib/study-tier";
import { cn } from "@/lib/utils";

import { MobileSidebar } from "./mobile-sidebar";

type Props = {
  isLoggedIn?: boolean;
  hearts?: number;
  points?: number;
};

const todayMinutes = 43;

const tierStyles = {
  none: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400",
  bronze: "border-orange-200 dark:border-orange-950/40 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400",
  silver: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400",
  gold: "border-amber-200 dark:border-amber-950/40 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400",
};

export const MobileHeader = ({ isLoggedIn = false, hearts = 5, points = 0 }: Props) => {
  const studyTier = getStudyTier(todayMinutes);

  return (
    <nav className="fixed top-0 z-50 flex h-[56px] w-full items-center border-b-2 border-[#e4edf5] dark:border-[#202f36] bg-white/95 dark:bg-[#182226]/95 px-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-none backdrop-blur sm:px-4 lg:hidden">
      <div className="flex w-full items-center justify-between gap-1.5 sm:gap-2">
        <MobileSidebar isLoggedIn={isLoggedIn} />

        <Link
          href="/learn"
          className="flex min-w-0 flex-1 items-center gap-x-2 px-1"
          aria-label="Về trang học Robogo"
        >
          <Image
            src="/logo.webp"
            height={34}
            width={34}
            alt="Robogo logo"
            priority
            className="shrink-0"
          />
          <span className="truncate text-lg font-extrabold tracking-tight text-[#1486CC] dark:text-[#38bdf8] min-[380px]:text-xl sm:text-2xl">
            Robogo
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 min-[380px]:gap-1.5">
          <div
            className={cn(
              "flex h-9 items-center gap-x-1 rounded-2xl border-2 px-1.5 text-xs font-black shadow-sm min-[380px]:px-2",
              tierStyles[studyTier.tone],
            )}
            title={studyTier.label}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {studyTier.icon}
            </span>
            <span>{todayMinutes}m</span>
          </div>


        </div>
      </div>
    </nav>
  );
};
