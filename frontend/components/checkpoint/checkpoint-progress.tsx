import { cn } from "@/lib/utils";

type Props = {
  currentIndex: number;
  answeredExerciseIds: Set<string>;
  exerciseIds: string[];
  onSelect: (index: number) => void;
};

export const CheckpointProgress = ({
  currentIndex,
  answeredExerciseIds,
  exerciseIds,
  onSelect,
}: Props) => (
  <nav aria-label="Điều hướng câu hỏi" className="space-y-3">
    <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
      <span>A2 Checkpoint</span>
      <span>
        {answeredExerciseIds.size}/{exerciseIds.length} đã trả lời
      </span>
    </div>
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
      {exerciseIds.map((exerciseId, index) => {
        const active = index === currentIndex;
        const answered = answeredExerciseIds.has(exerciseId);
        return (
          <button
            key={exerciseId}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={active ? "step" : undefined}
            aria-label={`Câu ${index + 1}${answered ? ", đã trả lời" : ", chưa trả lời"}`}
            className={cn(
              "flex aspect-square min-h-10 items-center justify-center rounded-xl border-2 text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40",
              active
                ? "border-[#1486CC] bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
                : answered
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : "border-slate-200 bg-white text-slate-400 hover:border-sky-300 dark:border-[#2a3c44] dark:bg-[#141f23] dark:text-slate-500",
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  </nav>
);
