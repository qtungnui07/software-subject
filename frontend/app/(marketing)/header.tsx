import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";

import {
  CourseDropdown,
  FeatureDropdown,
  LanguageDropdown,
  ThemeToggle,
} from "./header-controls";
import { HeaderSignOutButton } from "./header-signout-button";

export const Header = async () => {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 h-20 w-full border-b border-slate-200/80 bg-white/95 px-4 shadow-[0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 lg:h-24 lg:px-8">
      <div className="mx-auto flex h-full max-w-[1640px] items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-7">
          <Link
            id="header-logo-link"
            href="/"
            className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-85"
          >
            <Image
              src="/logo.webp"
              height={58}
              width={58}
              alt="Robogo logo"
              className="rounded-2xl shadow-sm"
            />

            <span className="text-3xl font-black tracking-tight text-[#1486CC] lg:text-[34px]">
              Robogo
            </span>
          </Link>

          <nav
            aria-label="Marketing navigation"
            className="hidden items-center gap-3 xl:flex"
          >
            <CourseDropdown />
            <FeatureDropdown />

            <Link
              href="#community"
              className="flex h-14 min-w-[132px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-base font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1D9BF0]/50 hover:bg-sky-50 hover:text-[#1486CC] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cộng đồng
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <LanguageDropdown />

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                id="header-learn-link"
                href="/learn"
                className="rounded-2xl border-b-4 border-[#0B6FAE] bg-[#1D9BF0] px-6 py-3 text-base font-black text-white shadow-sm transition-all duration-150 hover:bg-[#1486CC] active:translate-y-0.5 active:border-b-2"
              >
                Vào học
              </Link>

              <div className="hidden items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-base font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 2xl:flex">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sm font-black uppercase text-[#1486CC] dark:bg-slate-700">
                  {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
                </span>

                <span className="max-w-[140px] truncate">
                  {user.name ?? user.email}
                </span>
              </div>

              <HeaderSignOutButton />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                id="header-signin-link"
                href="/sign-in"
                className="rounded-2xl px-4 py-3 text-base font-black text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Đăng nhập
              </Link>

              <Link
                id="header-start-free-link"
                href="/sign-up"
                className="rounded-2xl border-b-4 border-[#0B6FAE] bg-[#1D9BF0] px-6 py-3 text-base font-black text-white shadow-[0_14px_26px_rgba(29,155,240,0.24)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#1486CC] active:translate-y-0.5 active:border-b-2"
              >
                <span className="hidden sm:inline">Bắt đầu miễn phí</span>
                <span className="sm:hidden">Bắt đầu</span>
              </Link>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
