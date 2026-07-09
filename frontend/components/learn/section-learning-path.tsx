"use client";

import Link from "next/link";
import { Check, Lock, Star, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  canAccessCourseNode,
  CHECKPOINT_UNLOCK_THRESHOLD,
} from "@/lib/courses/course-unlock-policy";
import type { CourseProgressState } from "@/lib/courses/course-progress";
import type { SectionDefinition } from "@/types/course";

type Props = {
  section: SectionDefinition;
  progress: CourseProgressState;
};

export const SectionLearningPath = ({ section, progress }: Props) => {
  const nodes = [...section.chapter.nodes].sort((left, right) => left.order - right.order);

  return (
    <div className="mx-auto max-w-2xl py-4 sm:py-8">
      <div className="relative space-y-8 before:absolute before:bottom-8 before:left-1/2 before:top-8 before:w-3 before:-translate-x-1/2 before:rounded-full before:bg-slate-100 dark:before:bg-[#202f36]">
        {nodes.map((node, index) => {
          const completed = progress.completedNodeIds.includes(node.id);
          const accessible = canAccessCourseNode(progress, node.id);
          const current = accessible && !completed;
          const checkpointScore = progress.checkpointScores[node.id] ?? 0;
          const alignRight = index % 2 === 1;
          const Icon = completed ? Check : node.type === "checkpoint" ? Trophy : current ? Star : Lock;

          return (
            <div
              key={node.id}
              className={cn(
                "relative z-10 flex items-center",
                alignRight ? "justify-end pr-[10%]" : "justify-start pl-[10%]"
              )}
            >
              <div className="flex w-[84%] max-w-sm items-center gap-4 rounded-[24px] border-2 border-slate-200 bg-white p-4 shadow-sm dark:border-[#263840] dark:bg-[#141f23] sm:w-[72%]">
                <div
                  className={cn(
                    "flex size-16 shrink-0 items-center justify-center rounded-full border-4 shadow-[0_7px_0_rgba(15,23,42,0.12)]",
                    completed && "border-emerald-500 bg-emerald-400 text-white",
                    current && "border-sky-600 bg-sky-500 text-white",
                    !completed && !current && "border-slate-300 bg-slate-200 text-slate-400 dark:border-[#263840] dark:bg-[#223138]"
                  )}
                >
                  <Icon className="size-7 stroke-[3]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    {node.type === "checkpoint" ? "Checkpoint" : `Bài ${node.order}`}
                  </p>
                  <h3 className="mt-1 text-base font-black text-slate-800 dark:text-white">
                    {node.shortTitle}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-slate-500 dark:text-slate-400">
                    {node.description}
                  </p>
                  {node.type === "checkpoint" && checkpointScore > 0 ? (
                    <p className={cn(
                      "mt-2 text-xs font-black",
                      checkpointScore >= CHECKPOINT_UNLOCK_THRESHOLD ? "text-emerald-500" : "text-amber-500"
                    )}>
                      Điểm cao nhất: {checkpointScore}%
                    </p>
                  ) : null}
                </div>

                {accessible && node.href ? (
                  <Link
                    href={node.href}
                    className="rounded-xl bg-sky-500 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-600"
                  >
                    {completed ? "Ôn lại" : "Học"}
                  </Link>
                ) : (
                  <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-400 dark:bg-[#223138]">
                    Khóa
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
