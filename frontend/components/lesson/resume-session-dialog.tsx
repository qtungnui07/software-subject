"use client";

import { RotateCcw, Save } from "lucide-react";

import { Button } from "@/components/ui/button";

export const ResumeSessionDialog = ({
  open,
  title,
  detail,
  warning,
  onResume,
  onRestart,
}: {
  open: boolean;
  title: string;
  detail: string;
  warning?: string;
  onResume: () => void;
  onRestart: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-2xl dark:border-[#2a3c44] dark:bg-[#152126]"
      >
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-[#1486CC] dark:bg-sky-950/40 dark:text-sky-300">
          <Save className="size-6" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-2 font-bold text-slate-600 dark:text-slate-300">
          {detail}
        </p>
        {warning ? (
          <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            {warning}
          </p>
        ) : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            variant="primary-outline"
            onClick={onRestart}
            className="h-12 rounded-2xl"
          >
            <RotateCcw className="size-4" /> Bắt đầu lại
          </Button>
          <Button
            variant="primary"
            onClick={onResume}
            className="h-12 rounded-2xl"
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
};
