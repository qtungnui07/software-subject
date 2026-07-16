"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BarChart3,
  BookOpen,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getPlacementSectionPresentation } from "@/lib/placement-test/placement-presentation";
import type { PlacementResultSummary } from "@/types/placement-test";

type Props = {
  result: PlacementResultSummary;
};

const scoreRows = [
  ["basic", "Cơ bản"],
  ["intermediate", "Trung cấp"],
  ["advanced", "Nâng cao"],
] as const;

export default function PlacementResultClient({ result }: Props) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const latest = getPlacementSectionPresentation(
    result.latestAssignedSectionId,
  );
  const highest = getPlacementSectionPresentation(
    result.highestAssignedSectionId,
  );

  const startRecommendedSection = async () => {
    setIsStarting(true);
    setStartError(null);

    try {
      const response = await fetch("/api/progress/course/select-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: result.latestAssignedSectionId }),
      });
      if (!response.ok) {
        throw new Error("Không thể chọn phần học được đề xuất.");
      }
      router.push("/learn");
    } catch (error) {
      setStartError(
        error instanceof Error ? error.message : "Không thể bắt đầu phần học.",
      );
      setIsStarting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6fbff] px-4 py-6 text-slate-800 dark:bg-[#101a1e] dark:text-slate-100 sm:py-10">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -left-20 top-24 size-80 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-800/10" />
        <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-800/10" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Robogo"
          >
            <Image
              src="/Robogo.svg"
              alt="Robogo"
              width={44}
              height={44}
              priority
            />
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              ROBOGO
            </span>
          </Link>
          <Link
            href="/learn"
            className="rounded-xl px-3 py-2 text-sm font-black text-slate-500 transition hover:bg-white dark:text-slate-400 dark:hover:bg-[#1b292f]"
          >
            Trang học
          </Link>
        </header>

        <section className="rounded-[2rem] border-2 border-slate-200 bg-white/95 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur dark:border-[#263840] dark:bg-[#152126]/95 sm:p-10">
          <div className="text-center">
            <div
              className={`mx-auto mb-5 flex size-24 items-center justify-center rounded-[2rem] bg-gradient-to-br ${latest.accentClassName} text-white shadow-xl`}
            >
              <Award className="size-12" />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles className="size-3.5" /> Trình độ đề xuất
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {latest.title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base font-bold leading-relaxed text-slate-500 dark:text-slate-400">
              {latest.description}
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-5 dark:border-[#263840] dark:bg-[#111c20]">
              <BarChart3 className="size-6 text-sky-500" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Tổng điểm
              </p>
              <p className="mt-1 text-4xl font-black text-slate-900 dark:text-white">
                {result.totalCorrect}
                <span className="text-xl text-slate-400">
                  /{result.totalQuestions}
                </span>
              </p>
              <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                Lần làm thứ {result.attemptCount}
              </p>
            </div>
            <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-5 dark:border-[#263840] dark:bg-[#111c20]">
              <Trophy className="size-6 text-amber-500" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Cấp cao nhất từng đạt
              </p>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {highest.title}
              </p>
              <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                Kết quả thấp hơn khi làm lại sẽ không làm giảm cấp cao nhất.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-2xl rounded-3xl border-2 border-slate-200 p-5 dark:border-[#263840] sm:p-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Điểm theo nhóm
            </h2>
            <div className="mt-5 space-y-4">
              {scoreRows.map(([key, label]) => {
                const score = result.bandScores[key];
                return (
                  <div key={key}>
                    <div className="mb-2 flex items-center justify-between text-sm font-black">
                      <span>{label}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {score}/4
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-[#223138]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                        style={{ width: `${score * 25}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="primary"
              className="h-14 rounded-2xl text-base sm:col-span-2"
              disabled={isStarting}
              onClick={() => void startRecommendedSection()}
            >
              <BookOpen className="size-5" />
              {isStarting ? "Đang mở lộ trình..." : `Bắt đầu ${latest.title}`}
            </Button>
            <Button
              asChild
              variant="primary-outline"
              className="h-14 rounded-2xl text-base"
            >
              <Link href="/learn">
                <BookOpen className="size-5" /> Quay lại trang học
              </Link>
            </Button>
            <Button
              asChild
              variant="primary-outline"
              className="h-14 rounded-2xl text-base"
            >
              <Link href="/placement-test?start=1">
                <RotateCcw className="size-5" /> Làm lại bài kiểm tra
              </Link>
            </Button>
          </div>
          {startError ? (
            <p className="mt-4 text-center text-sm font-bold text-rose-500">
              {startError}
            </p>
          ) : null}
          <p className="mt-5 text-center text-xs font-bold text-slate-400">
            Kết quả kiểm tra đã được áp dụng. Các phần đã mở sẽ không bị khóa
            lại khi bạn làm lại bài kiểm tra.
          </p>
        </section>
      </div>
    </main>
  );
}
