import Image from "next/image";
import Link from "next/link";

import { SidebarItem } from "./sidebar-item";

import { getStudyTier } from "@/lib/study-tier";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const routes = [
  {
    label: "Học",
    href: "/learn",
    iconSrc: "/learn.svg",
  },
  {
    label: "Khóa học",
    href: "/courses",
    iconSrc: "/globe.svg",
  },
  {
    label: "Bảng xếp hạng",
    href: "/leaderboard",
    iconSrc: "/leaderboard.svg",
  },
  {
    label: "Nhiệm vụ",
    href: "/quests",
    iconSrc: "/quests.svg",
  },
  {
    label: "Cửa hàng",
    href: "/shop",
    iconSrc: "/shop.svg",
  },
  {
    label: "Hồ sơ",
    href: "/profile",
    iconSrc: "/heart.svg",
  },
  {
    label: "Xem thêm",
    href: "/more",
    iconSrc: "/window.svg",
  },
];

const currentMinutes = 43;
const goalMinutes = 60;
const progressPercent = Math.min(
  Math.round((currentMinutes / goalMinutes) * 100),
  100,
);

const currentTier = getStudyTier(currentMinutes);

const milestones = [
  {
    label: "15m",
    title: "Bronze",
    left: "25%",
    className: "bg-[#c8843d] ring-[#f4d2ad]",
  },
  {
    label: "30m",
    title: "Silver",
    left: "50%",
    className: "bg-[#9ca3af] ring-[#e5e7eb]",
  },
  {
    label: "1h",
    title: "Gold",
    left: "100%",
    className: "bg-[#f5b828] ring-[#fde68a]",
  },
];

export const Sidebar = ({ className }: Props) => {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-y-auto border-r-2 border-[#e4edf5] bg-gradient-to-b from-white via-white to-[#f7fbff] px-5 py-6 lg:fixed lg:left-0 lg:top-0 lg:w-[304px]",
        className,
      )}
    >
      <Link
        href="/learn"
        className="mb-7 flex items-center gap-x-4 rounded-[22px] px-3 py-3 transition-all hover:bg-[#f4faff]"
      >
        <div className="relative size-[64px] shrink-0 drop-shadow-[0_8px_18px_rgba(20,134,204,0.18)]">
          <Image
            src="/logo.svg"
            alt="Robogo logo"
            fill
            priority
            className="object-contain"
            sizes="64px"
          />
        </div>

        <div className="min-w-0">
          <h1 className="text-[32px] font-extrabold leading-none tracking-tight text-[#1486CC]">
            Robogo
          </h1>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
            Learn smarter
          </p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-y-2">
        {routes.map((route) => (
          <SidebarItem key={route.href} {...route} />
        ))}
      </nav>

      <div className="mt-6 rounded-[22px] border-2 border-[#d6ecfb] bg-white p-4 shadow-[0_10px_30px_rgba(20,134,204,0.10)]">
        <div className="flex items-center gap-x-3">
          <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#e8f5ff] text-[#1486CC] shadow-sm">
            <span className="text-lg leading-none" aria-hidden="true">
              {currentTier.icon}
            </span>
            <span className="mt-0.5 text-[10px] font-black leading-none">
              {currentMinutes}m
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-wide text-slate-700">
              Mục tiêu ngày
            </p>
            <p className="text-xs font-bold text-slate-400">
              {currentMinutes}m hôm nay · {currentTier.label}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="relative h-3 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#1486CC] shadow-[0_3px_10px_rgba(20,134,204,0.25)]"
              style={{ width: `${progressPercent}%` }}
            />

            {milestones.map((milestone) => (
              <span
                key={milestone.label}
                title={milestone.title}
                className={cn(
                  "absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-offset-0",
                  milestone.className,
                )}
                style={{ left: milestone.left }}
              />
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 text-[10px] font-black uppercase tracking-wide text-slate-400">
            <span>15m Đồng</span>
            <span className="text-center">30m Bạc</span>
            <span className="text-right">1h Vàng</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
