import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

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
        <div className="flex min-w-0 items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 rounded-2xl text-white hover:bg-white/15 hover:text-white"
          >
            <Link href="/courses" aria-label="Quay lại danh sách khóa học">
              <ArrowLeft className="h-5 w-5 stroke-[3]" />
            </Link>
          </Button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-black uppercase tracking-[0.16em] text-sky-100 sm:text-sm">
              <span>{courseTitle}</span>
              <span className="hidden opacity-70 sm:inline">•</span>
              <span>{sectionLabel}</span>
            </div>
            <h1 className="mt-1 truncate text-2xl font-black leading-tight sm:text-3xl">
              {chapterTitle}
            </h1>
          </div>
        </div>

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
