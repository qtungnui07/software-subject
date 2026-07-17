import { cn } from "@/lib/utils";

type Props = {
  current: number;
  total: number;
};

export const PlacementProgress = ({ current, total }: Props) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="flex-1" aria-label={`Tiến độ ${current} trên ${total} câu`}>
      <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        <span>Kiểm tra đầu vào</span>
        <span>{current}/{total}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-[#223138]">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-[width] duration-500 motion-reduce:transition-none"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
