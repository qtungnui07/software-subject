"use client";

import Link from "next/link";
import { ChevronRight, Layers3 } from "lucide-react";

import { GuideDialog } from "./guide-dialog";

type Props = {
  courseTitle: string;
  sectionLabel: string;
  chapterTitle: string;
};

export const Header = ({ courseTitle, sectionLabel, chapterTitle }: Props) => {
  return (
    <div className="relative overflow-hidden rounded-[24px] border-b-4 border-[#0B6FAE] bg-[#1D9BF0] px-4 py-4 text-white shadow-[0_14px_28px_rgba(29,155,240,0.22)] sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-white/15" />
      <div className="pointer-events-none absolute -bottom-20 right-12 h-36 w-36 rounded-full bg-sky-200/20" />

      <div className="relative flex items-center justify-between gap-3">
        <Link
          href="/sections"
          aria-label="Xem các phần học"
          className="group -m-1 flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 outline-none transition hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/45"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/15 transition group-hover:bg-white/20">
            <Layers3 className="h-5 w-5 stroke-[2.8]" aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-black uppercase tracking-[0.16em] text-sky-100 sm:text-sm">
              <span>{courseTitle}</span>
              <span className="hidden opacity-70 sm:inline">•</span>
              <span>{sectionLabel}</span>
            </span>
            <span className="mt-1 flex min-w-0 items-center gap-2">
              <span className="truncate text-2xl font-black leading-tight sm:text-3xl">
                {chapterTitle}
              </span>
              <ChevronRight
                className="size-6 shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </span>
        </Link>

        <div className="hidden shrink-0 sm:block">
          <GuideDialog />
        </div>
      </div>

      <div className="relative mt-4 sm:hidden">
        <GuideDialog />
      </div>
    </div>
  );
};
