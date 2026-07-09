"use client";

import { CheckCircle2, Lock, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SectionViewStatus } from "@/lib/courses/course-view-model";

type SectionItem = {
  id: string;
  order: number;
  title: string;
  status: SectionViewStatus;
  unlocked: boolean;
  recommended: boolean;
};

type Props = {
  sections: SectionItem[];
  selectedSectionId: string;
  onSelect: (sectionId: string) => void;
};

export const SectionSwitcher = ({ sections, selectedSectionId, onSelect }: Props) => {
  return (
    <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-2">
        {sections.map((section) => {
          const selected = section.id === selectedSectionId;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className={cn(
                "flex min-h-12 items-center gap-2 rounded-2xl border-2 px-4 py-2 text-left text-sm font-black transition",
                selected
                  ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-500 dark:bg-sky-950/30 dark:text-sky-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 dark:border-[#263840] dark:bg-[#141f23] dark:text-slate-300",
                !section.unlocked && !selected && "opacity-75"
              )}
            >
              {section.status === "completed" ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : section.unlocked ? (
                section.recommended ? <Sparkles className="size-4 text-violet-500" /> : null
              ) : (
                <Lock className="size-4 text-slate-400" />
              )}
              <span>{section.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
