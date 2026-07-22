"use client";

import type { DraftSaveStatus } from "@/types/learning-session-draft";

export const SessionSaveStatus = ({ status }: { status: DraftSaveStatus }) => {
  const label =
    status === "saving"
      ? "Đang lưu..."
      : status === "saved"
        ? "Đã lưu"
        : status === "error"
          ? "Không thể lưu"
          : null;
  if (!label) return null;
  return (
    <span aria-live="polite" className="text-xs font-black text-slate-400">
      {label}
    </span>
  );
};
