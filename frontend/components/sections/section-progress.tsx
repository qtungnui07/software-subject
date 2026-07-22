type Props = {
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
};

export const SectionProgress = ({
  completedLessons,
  totalLessons,
  completionPercent,
}: Props) => {
  return (
    <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/80 p-4 dark:border-[#263840] dark:bg-[#111c20]">
      <div className="flex items-center justify-between gap-4 text-sm font-black">
        <span className="text-slate-600 dark:text-slate-300">
          {completedLessons}/{totalLessons} bài bắt buộc
        </span>
        <span className="text-[#1486CC] dark:text-sky-400">
          {completionPercent}%
        </span>
      </div>
      <div
        className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-[#223138]"
        role="progressbar"
        aria-label="Tiến độ phần học"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completionPercent}
      >
        <div
          className="h-full rounded-full bg-[#1486CC] transition-[width] duration-500"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
    </div>
  );
};
