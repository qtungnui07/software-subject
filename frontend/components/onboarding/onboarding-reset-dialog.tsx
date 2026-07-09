import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export type OnboardingResetDialogProps = {
  open: boolean;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const OnboardingResetDialog = ({
  open,
  isSubmitting = false,
  onCancel,
  onConfirm,
}: OnboardingResetDialogProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-reset-title"
    >
      <div className="w-full max-w-md rounded-[1.75rem] border-2 border-slate-200 bg-white p-6 shadow-2xl dark:border-[#2b3d45] dark:bg-[#152126]">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
          <AlertTriangle className="size-6" />
        </div>
        <h2
          id="onboarding-reset-title"
          className="mt-4 text-2xl font-black text-slate-900 dark:text-white"
        >
          Chuyển sang học từ cơ bản?
        </h2>
        <p className="mt-3 text-sm font-bold leading-7 text-slate-500 dark:text-slate-400">
          Bài kiểm tra đang làm dở trong phiên trình duyệt này sẽ bị xóa. Bạn vẫn có thể làm lại bài kiểm tra sau.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="primary-outline"
            className="h-12 rounded-2xl"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Tiếp tục kiểm tra
          </Button>
          <Button
            type="button"
            variant="primary"
            className="h-12 rounded-2xl"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? "Đang cập nhật..." : "Bắt đầu Phần 1"}
          </Button>
        </div>
      </div>
    </div>
  );
};
