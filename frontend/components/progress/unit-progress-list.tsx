import { BarChart3 } from "lucide-react";

import type { ProgressUnit } from "@/data/progress-data";
import { getUnitProgressSummary } from "@/lib/progress-utils";
import { cn } from "@/lib/utils";

import { UnitProgressCard } from "./unit-progress-card";

type Props = {
  units: ProgressUnit[];
  className?: string;
};

export const UnitProgressList = ({ units, className }: Props) => {
  return (
    <section
      className={cn(
        "rounded-[24px] border-2 border-sky-100 dark:border-[#202f36] bg-white dark:bg-[#182226] p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-500">
            <BarChart3 className="h-4 w-4" />
            Từng Unit
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-800 dark:text-slate-100">
            Tiến độ từng Unit
          </h2>
        </div>
      </div>

      <div className="mt-4 grid gap-2.5">
        {units.map((unit) => (
          <UnitProgressCard
            key={unit.id}
            unit={unit}
            summary={getUnitProgressSummary(unit)}
          />
        ))}
      </div>
    </section>
  );
};
