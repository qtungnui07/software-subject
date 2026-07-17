import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type OnboardingChoiceCardProps = {
  title: string;
  description: string;
  eyebrow: string;
  actionLabel: string;
  icon: LucideIcon;
  tone: "emerald" | "sky";
  disabled?: boolean;
  onSelect: () => void;
};

const toneStyles = {
  emerald: {
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300",
    eyebrow: "text-emerald-600 dark:text-emerald-300",
    border:
      "hover:border-emerald-300 hover:shadow-[0_16px_45px_rgba(16,185,129,0.12)] dark:hover:border-emerald-800",
  },
  sky: {
    icon: "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300",
    eyebrow: "text-sky-600 dark:text-sky-300",
    border:
      "hover:border-sky-300 hover:shadow-[0_16px_45px_rgba(14,165,233,0.12)] dark:hover:border-sky-800",
  },
};

export const OnboardingChoiceCard = ({
  title,
  description,
  eyebrow,
  actionLabel,
  icon: Icon,
  tone,
  disabled = false,
  onSelect,
}: OnboardingChoiceCardProps) => {
  const styles = toneStyles[tone];

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-[1.75rem] border-2 border-slate-200 bg-white p-6 transition duration-200 dark:border-[#263840] dark:bg-[#152126] sm:p-7",
        styles.border,
      )}
    >
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl",
          styles.icon,
        )}
      >
        <Icon className="size-7" />
      </div>
      <p
        className={cn(
          "mt-5 text-xs font-black uppercase tracking-[0.16em]",
          styles.eyebrow,
        )}
      >
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-3 flex-1 text-sm font-bold leading-7 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      <Button
        type="button"
        variant="primary"
        className="mt-6 h-14 rounded-2xl text-base"
        disabled={disabled}
        onClick={onSelect}
      >
        {actionLabel}
      </Button>
    </article>
  );
};
