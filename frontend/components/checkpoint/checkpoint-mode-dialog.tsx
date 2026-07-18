"use client";

import { Headphones, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AssessmentMode } from "@/types/learning-session-draft";

export const CheckpointModeDialog = ({
  open,
  onSelect,
}: {
  open: boolean;
  onSelect: (mode: AssessmentMode) => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-xl rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-2xl dark:border-[#2a3c44] dark:bg-[#152126]"
      >
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Chọn chế độ checkpoint
        </h2>
        <p className="mt-2 font-bold text-slate-600 dark:text-slate-300">
          Chế độ được khóa cho attempt này. Bạn có thể chọn lại khi làm lại.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Button
            variant="primary-outline"
            onClick={() => onSelect("standard")}
            className="h-auto min-h-32 flex-col rounded-3xl p-5"
          >
            <Headphones className="size-7" />
            <span>Chế độ tiêu chuẩn</span>
            <small className="normal-case tracking-normal">
              Có bài kiểm tra nghe
            </small>
          </Button>
          <Button
            variant="primary"
            onClick={() => onSelect("silent")}
            className="h-auto min-h-32 flex-col rounded-3xl p-5"
          >
            <VolumeX className="size-7" />
            <span>Không âm thanh</span>
            <small className="normal-case tracking-normal">
              Dùng đoạn đọc tương đương
            </small>
          </Button>
        </div>
      </div>
    </div>
  );
};
