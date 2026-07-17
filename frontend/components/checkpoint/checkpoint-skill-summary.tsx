import type { CheckpointSkillScore } from "@/types/checkpoint";

const labels: Record<CheckpointSkillScore["category"], string> = {
  vocabulary: "Từ vựng",
  grammar: "Ngữ pháp",
  reading: "Reading",
  listening: "Listening",
  conversation: "Giao tiếp",
  writing: "Writing",
};

export const CheckpointSkillSummary = ({
  scores,
}: {
  scores: CheckpointSkillScore[];
}) => (
  <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Điểm theo kỹ năng">
    {scores.map((item) => (
      <article
        key={item.category}
        className="rounded-2xl border-2 border-slate-200 bg-white p-4 dark:border-[#263840] dark:bg-[#141f23]"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">
            {labels[item.category]}
          </h3>
          <span className="text-sm font-black text-[#1486CC]">
            {Math.round(item.score)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#223138]">
          <div
            className="h-full rounded-full bg-[#1486CC]"
            style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
          />
        </div>
      </article>
    ))}
  </section>
);
