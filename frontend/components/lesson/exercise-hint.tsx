"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  hint: string;
  available: boolean;
};

export const ExerciseHint = ({ hint, available }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!available) return null;

  return (
    <section className="rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="h-11 w-full justify-between rounded-xl px-3 text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-950/40"
      >
        <span className="flex items-center gap-2 font-black">
          <Lightbulb className="size-4" aria-hidden="true" />
          Xem gợi ý
        </span>
        {isOpen ? (
          <ChevronUp className="size-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4" aria-hidden="true" />
        )}
      </Button>

      {isOpen ? (
        <p className="px-3 pb-2 pt-2 text-sm font-bold leading-6 text-amber-800/90 dark:text-amber-200">
          {hint}
        </p>
      ) : null}
    </section>
  );
};
