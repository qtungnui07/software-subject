"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";

import { CheckpointSkillSummary } from "@/components/checkpoint/checkpoint-skill-summary";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CheckpointSubmissionResult } from "@/types/checkpoint";

const lessonNames: Record<string, string> = {
  "lesson-1": "Lesson 1 — Gặp một người bạn mới",
  "lesson-2": "Lesson 2 — Một ngày của tôi",
  "lesson-3": "Lesson 3 — Tại quán cà phê",
  "lesson-4": "Lesson 4 — Đi quanh thành phố",
  "lesson-5": "Lesson 5 — Lên kế hoạch",
  "lesson-6": "Lesson 6 — Nhiệm vụ cuối tuần",
};

type Props = {
  result: CheckpointSubmissionResult;
  onRetake: () => void;
  onBackToLearn: () => void;
  onContinueToSectionTwo: () => void;
  onOpenLesson: (lessonId: string) => void;
};

export const CheckpointResultScreen = ({
  result,
  onRetake,
  onBackToLearn,
  onContinueToSectionTwo,
  onOpenLesson,
}: Props) => {
  const [showReview, setShowReview] = useState(false);
  const passed = result.passed;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-[#10191d] sm:py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="overflow-hidden rounded-3xl border-2 border-slate-200 bg-white shadow-xl dark:border-[#2a3c44] dark:bg-[#152126]">
          <div
            className={cn(
              "px-5 py-8 text-center sm:px-8 sm:py-10",
              passed
                ? "bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-emerald-950/30 dark:via-[#152126] dark:to-sky-950/20"
                : "bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/30 dark:via-[#152126] dark:to-orange-950/20",
            )}
          >
            <div
              className={cn(
                "mx-auto mb-5 flex size-20 items-center justify-center rounded-3xl",
                passed
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300",
              )}
            >
              {passed ? <Trophy className="size-10" /> : <BookOpenCheck className="size-10" />}
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
              {passed ? "Bạn đã vượt qua A2 Checkpoint!" : "Bạn cần ôn thêm một chút"}
            </h1>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-sky-600 dark:text-sky-300">
              Chế độ đánh giá: {result.assessmentMode === "silent" ? "Không âm thanh" : "Tiêu chuẩn"}
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-bold leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              {passed
                ? "Section 2 đã được mở khóa. Điểm thấp hơn ở các lần làm lại sau sẽ không khóa lại quyền truy cập này."
                : `Bạn cần đạt ít nhất 70%. Các lesson bên dưới được đề xuất dựa trên chính những kỹ năng còn yếu trong lượt làm này.`}
            </p>

            <div className="mx-auto mt-7 grid max-w-xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border-2 border-slate-200 bg-white/90 p-4 dark:border-[#2a3c44] dark:bg-[#141f23]/90">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Điểm lượt này</p>
                <p className="mt-1 text-3xl font-black text-[#1486CC]">{result.score.toFixed(result.score % 1 ? 2 : 0)}%</p>
              </div>
              <div className="rounded-2xl border-2 border-slate-200 bg-white/90 p-4 dark:border-[#2a3c44] dark:bg-[#141f23]/90">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Điểm cao nhất</p>
                <p className="mt-1 text-3xl font-black text-violet-600 dark:text-violet-300">{result.bestScore.toFixed(result.bestScore % 1 ? 2 : 0)}%</p>
              </div>
              <div className="rounded-2xl border-2 border-slate-200 bg-white/90 p-4 dark:border-[#2a3c44] dark:bg-[#141f23]/90">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Đã trả lời</p>
                <p className="mt-1 text-3xl font-black text-slate-800 dark:text-slate-100">{result.answeredQuestions}/{result.totalQuestions}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-8">
            <CheckpointSkillSummary scores={result.skillScores} />

            {!passed && result.recommendedLessonIds.length > 0 ? (
              <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 dark:border-amber-950/60 dark:bg-amber-950/20">
                <h2 className="text-lg font-black text-amber-800 dark:text-amber-200">
                  Nên ôn lại
                </h2>
                <div className="mt-3 grid gap-2">
                  {result.recommendedLessonIds.map((lessonId) => (
                    <button
                      key={lessonId}
                      type="button"
                      onClick={() => onOpenLesson(lessonId)}
                      className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border-2 border-amber-200 bg-white px-4 text-left text-sm font-black text-slate-700 transition hover:border-amber-400 dark:border-amber-900 dark:bg-[#141f23] dark:text-slate-200"
                    >
                      <span>{lessonNames[lessonId] ?? lessonId}</span>
                      <ArrowRight className="size-4" />
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              {passed ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={onContinueToSectionTwo}
                  className="h-12 rounded-2xl sm:col-span-2"
                >
                  Tiếp tục đến Section 2
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={onRetake}
                  className="h-12 rounded-2xl sm:col-span-2"
                >
                  <RefreshCw className="size-4" />
                  Làm lại checkpoint
                </Button>
              )}
              <Button
                type="button"
                variant="primary-outline"
                onClick={onBackToLearn}
                className="h-12 rounded-2xl"
              >
                Về lộ trình
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 dark:border-[#2a3c44] dark:bg-[#152126] sm:p-6">
          <button
            type="button"
            onClick={() => setShowReview((current) => !current)}
            className="flex w-full items-center justify-between gap-4 text-left"
            aria-expanded={showReview}
          >
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Xem lại kết quả từng câu
              </h2>
              <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                Đáp án, giải thích và transcript chỉ được mở sau khi đã nộp bài.
              </p>
            </div>
            {showReview ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
          </button>

          {showReview ? (
            <div className="mt-5 space-y-3">
              {result.reviews.map((review) => {
                const correct = review.status === "correct";
                const unanswered = review.status === "unanswered";
                return (
                  <article
                    key={review.exerciseId}
                    className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 dark:border-[#263840] dark:bg-[#111b1f]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {correct ? (
                          <CheckCircle2 className="size-5 text-emerald-500" />
                        ) : (
                          <XCircle className={cn("size-5", unanswered ? "text-slate-400" : "text-amber-500")} />
                        )}
                        <h3 className="font-black text-slate-800 dark:text-slate-100">
                          Câu {review.order}
                        </h3>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 dark:bg-[#1b292f] dark:text-slate-300">
                        {Math.round(review.scoreRatio * 100)}%
                      </span>
                    </div>
                    {review.result ? (
                      <div className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
                        {review.result.explanation ? <p>{review.result.explanation}</p> : null}
                        <p>
                          <span className="font-black">Đáp án tham khảo:</span>{" "}
                          {review.result.correctAnswerText}
                        </p>
                        {review.result.feedbackCriteria?.length ? (
                          <ul className="space-y-1">
                            {review.result.feedbackCriteria.map((criterion) => (
                              <li key={criterion.id}>
                                {criterion.passed ? "✓" : "✗"} {criterion.label}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm font-bold text-slate-500">Câu này chưa được trả lời và được tính 0 điểm.</p>
                    )}
                    {review.transcript ? (
                      <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 dark:border-sky-900 dark:bg-sky-950/20">
                        <p className="text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">Transcript</p>
                        <p className="mt-1 whitespace-pre-line text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">{review.transcript}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>

        {passed ? (
          <div className="text-center">
            <Button type="button" variant="ghost" onClick={onRetake} className="normal-case tracking-normal text-slate-500">
              <RotateCcw className="size-4" /> Làm lại để cải thiện điểm cao nhất
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
};
