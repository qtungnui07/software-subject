"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  answeredCount: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onClose: () => void;
  onReturnToMissing: () => void;
  onSubmit: () => void;
};

export const PlacementReviewDialog = ({
  open,
  answeredCount,
  totalQuestions,
  isSubmitting,
  onClose,
  onReturnToMissing,
  onSubmit,
}: Props) => {
  if (!open) return null;
  const missingCount = totalQuestions - answeredCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="placement-review-title"
    >
      <div className="w-full max-w-md rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-2xl dark:border-[#2a3c44] dark:bg-[#152126] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${missingCount ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
              {missingCount ? <AlertTriangle className="size-6" /> : <CheckCircle2 className="size-6" />}
            </div>
            <div>
              <h2 id="placement-review-title" className="text-xl font-black text-slate-900 dark:text-white">
                {missingCount ? "Bạn chưa trả lời hết" : "Sẵn sàng nộp bài"}
              </h2>
              <p className="mt-1 text-sm font-bold leading-relaxed text-slate-500 dark:text-slate-400">
                Bạn đã trả lời {answeredCount}/{totalQuestions} câu.
                {missingCount
                  ? ` ${missingCount} câu bỏ trống sẽ được tính là sai.`
                  : " Hãy nộp bài để nhận kết quả đề xuất."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#223138] dark:hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {missingCount ? (
            <Button
              type="button"
              variant="primary-outline"
              onClick={onReturnToMissing}
              disabled={isSubmitting}
              className="h-12 rounded-2xl"
            >
              Quay lại hoàn thành
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary-outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-12 rounded-2xl"
            >
              Kiểm tra lại
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="h-12 rounded-2xl"
          >
            {isSubmitting ? "Đang nộp..." : "Nộp bài"}
          </Button>
        </div>
      </div>
    </div>
  );
};
