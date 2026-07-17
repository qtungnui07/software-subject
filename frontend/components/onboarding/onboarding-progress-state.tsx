import { BrainCircuit, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export type OnboardingProgressStateProps = {
  disabled?: boolean;
  onContinue: () => void;
  onChooseBasic: () => void;
};

export const OnboardingProgressState = ({
  disabled = false,
  onContinue,
  onChooseBasic,
}: OnboardingProgressStateProps) => (
  <section className="rounded-[1.75rem] border-2 border-amber-200 bg-amber-50/90 p-6 dark:border-amber-900/50 dark:bg-amber-950/20 sm:p-8">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
        <BrainCircuit className="size-7" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">
          Đang thiết lập lộ trình
        </p>
        <h2 className="mt-2 text-2xl font-black text-amber-950 dark:text-amber-100">
          Bài kiểm tra của bạn chưa hoàn thành
        </h2>
        <p className="mt-2 text-sm font-bold leading-7 text-amber-800/80 dark:text-amber-200/80">
          Tiếp tục 12 câu kiểm tra để Robogo đề xuất phần học phù hợp, hoặc chuyển sang học từ nền tảng.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="primary"
            className="h-12 rounded-2xl"
            disabled={disabled}
            onClick={onContinue}
          >
            Tiếp tục bài kiểm tra
          </Button>
          <Button
            type="button"
            variant="primary-outline"
            className="h-12 rounded-2xl"
            disabled={disabled}
            onClick={onChooseBasic}
          >
            <RotateCcw className="size-4" /> Bắt đầu từ cơ bản
          </Button>
        </div>
      </div>
    </div>
  </section>
);
