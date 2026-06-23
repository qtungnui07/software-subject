"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { SidebarItem } from "./sidebar-item";
import { Button } from "@/components/ui/button";

import { getStudyTier } from "@/lib/study-tier";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  isLoggedIn?: boolean;
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

export const Sidebar = ({ className, isLoggedIn = false }: Props) => {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { signOut } = useClerk();

  const handleHelp = () => {
    setIsMoreOpen(false);
    toast.info("Tính năng Trợ giúp đang được phát triển!");
  };

  const handleSignOut = async () => {
    setIsMoreOpen(false);
    try {
      await fetch("/api/auth/local/sign-out", { method: "POST" });
    } catch (e) {
      console.error("Local sign out error:", e);
    }
    try {
      await signOut();
    } catch (e) {
      console.error("Clerk sign out error:", e);
    }
    window.location.href = "/";
  };

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-y-auto lg:overflow-visible border-r-2 border-[#e4edf5] dark:border-[#202f36] bg-gradient-to-b from-white dark:from-[#131f24] via-white dark:via-[#131f24] to-[#f7fbff] dark:to-[#131f24] px-5 py-6 lg:fixed lg:left-0 lg:top-0 lg:w-[304px] lg:z-40 transition-colors duration-300",
        className,
      )}
    >
      <Link
        href="/learn"
        className="mb-7 flex items-center gap-x-4 rounded-[22px] px-3 py-3 transition-all hover:bg-[#f4faff] dark:hover:bg-[#1f2d33]"
      >
        <div className="relative size-[64px] shrink-0 drop-shadow-[0_8px_18px_rgba(20,134,204,0.18)]">
          <Image
            src="/logo.webp"
            alt="Robogo logo"
            fill
            priority
            className="object-contain rounded-2xl"
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

        {/* Xem thêm Popover Button */}
        <div
          className="relative"
          onMouseEnter={() => setIsMoreOpen(true)}
          onMouseLeave={() => setIsMoreOpen(false)}
        >
          {isMoreOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-0 lg:bottom-0 lg:left-full lg:pl-4 z-50 w-full lg:w-[256px]">
              <div className="w-full rounded-[20px] border-2 border-slate-200 dark:border-[#202f36] bg-white dark:bg-[#141f23] p-1.5 shadow-[0_12px_30px_rgba(20,134,204,0.15)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-2 lg:slide-in-from-left-2 duration-150">
                <Link
                  href="/settings/account"
                  className={cn(
                    "flex w-full items-center rounded-xl px-4 py-3 text-[13px] font-black uppercase tracking-[0.12em] transition",
                    pathname.startsWith("/settings")
                      ? "bg-slate-100 text-[#1486CC] dark:bg-[#1f2d33] dark:text-white"
                      : "text-slate-600 dark:text-[#afbfcb] hover:bg-[#f4faff] hover:text-[#1486CC] dark:hover:bg-[#1f2d33] dark:hover:text-white"
                  )}
                  onClick={() => setIsMoreOpen(false)}
                >
                  Cài đặt
                </Link>
                <button
                  type="button"
                  onClick={handleHelp}
                  className="flex w-full items-center rounded-xl px-4 py-3 text-[13px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-[#afbfcb] transition hover:bg-[#f4faff] hover:text-[#1486CC] dark:hover:bg-[#1f2d33] dark:hover:text-white text-left cursor-pointer"
                >
                  Trợ giúp
                </button>
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center rounded-xl px-4 py-3 text-[13px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-[#afbfcb] transition hover:bg-[#f4faff] hover:text-[#1486CC] dark:hover:bg-[#1f2d33] dark:hover:text-white text-left cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                ) : (
                  <Link
                    href="/sign-in"
                    className="flex w-full items-center rounded-xl px-4 py-3 text-[13px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-[#afbfcb] transition hover:bg-[#f4faff] hover:text-[#1486CC] dark:hover:bg-[#1f2d33] dark:hover:text-white"
                    onClick={() => setIsMoreOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          )}

          <Button
            variant={pathname.startsWith("/settings") ? "sidebar-outline" : "sidebar"}
            className={cn(
              "h-[58px] w-full justify-start rounded-[18px] px-4 text-[15px] hover:bg-[#f4faff] active:bg-[#e8f5ff] transition",
              isMoreOpen && "bg-[#f4faff]",
            )}
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMoreOpen((prev) => !prev);
              }
            }}
          >
            <Image
              src="/window.svg"
              alt=""
              className="mr-4 size-8 object-contain"
              height={32}
              width={32}
            />
            <span className="truncate">XEM THÊM</span>
          </Button>
        </div>
      </nav>

      <div className="mt-6 rounded-[22px] border-2 border-[#d6ecfb] dark:border-[#202f36] bg-white dark:bg-[#182226] p-4 shadow-[0_10px_30px_rgba(20,134,204,0.10)] dark:shadow-none">
        <div className="flex items-center gap-x-3">
          <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#e8f5ff] dark:bg-[#1c3547] text-[#1486CC] dark:text-[#38bdf8] shadow-sm">
            <span className="text-lg leading-none" aria-hidden="true">
              {currentTier.icon}
            </span>
            <span className="mt-0.5 text-[10px] font-black leading-none">
              {currentMinutes}m
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
              Mục tiêu ngày
            </p>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-400">
              {currentMinutes}m hôm nay · {currentTier.label}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="relative h-3 rounded-full bg-slate-100 dark:bg-[#141f23]">
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

          <div className="mt-3 grid grid-cols-3 text-[10px] font-black uppercase tracking-wide text-slate-400 dark:text-slate-400">
            <span>15m Đồng</span>
            <span className="text-center">30m Bạc</span>
            <span className="text-right">1h Vàng</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
