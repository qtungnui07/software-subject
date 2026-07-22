"use client";

import { Headphones, VolumeX } from "lucide-react";

import type { AssessmentMode } from "@/types/learning-session-draft";

export const SilentModeToggle = ({
  mode,
  onChange,
  disabled = false,
}: {
  mode: AssessmentMode;
  onChange: (mode: AssessmentMode) => void;
  disabled?: boolean;
}) => (
  <div
    className="inline-flex rounded-2xl border-2 border-slate-200 bg-white p-1 dark:border-[#2a3c44] dark:bg-[#152126]"
    aria-label="Chế độ âm thanh"
  >
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange("standard")}
      className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-black transition ${mode === "standard" ? "bg-sky-100 text-[#1486CC] dark:bg-sky-950/50 dark:text-sky-300" : "text-slate-500"}`}
    >
      <Headphones className="size-4" /> Chế độ nghe
    </button>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange("silent")}
      className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-black transition ${mode === "silent" ? "bg-sky-100 text-[#1486CC] dark:bg-sky-950/50 dark:text-sky-300" : "text-slate-500"}`}
    >
      <VolumeX className="size-4" /> Không thể nghe
    </button>
  </div>
);
