"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  Clock3,
  History,
  LogIn,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { PlacementProgress } from "@/components/placement-test/placement-progress";
import { PlacementQuestionRenderer } from "@/components/placement-test/placement-question-renderer";
import { PlacementReviewDialog } from "@/components/placement-test/placement-review-dialog";
import { Button } from "@/components/ui/button";
import {
  countAnsweredPlacementQuestions,
  createPlacementDraft,
  getPlacementDraftStorageKey,
  isPlacementAnswerComplete,
  parsePlacementDraft,
  type PlacementDraft,
} from "@/lib/placement-test/placement-draft";
import { getPlacementSectionPresentation } from "@/lib/placement-test/placement-presentation";
import type { ExerciseAnswer } from "@/types/exercise";
import type {
  PlacementResultSummary,
  PlacementTestGetResponse,
} from "@/types/placement-test";

type Props = {
  isAuthenticated: boolean;
  userKey: string | null;
  initialPreviousResult: PlacementResultSummary | null;
  autoStart?: boolean;
  fromOnboarding?: boolean;
};

type ScreenState = "intro" | "resume" | "test";

const getErrorMessage = (value: unknown, fallback: string) => {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }
  return fallback;
};

export default function PlacementTestClient({
  isAuthenticated,
  userKey,
  initialPreviousResult,
  autoStart = false,
  fromOnboarding = false,
}: Props) {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenState>("intro");
  const [testData, setTestData] = useState<PlacementTestGetResponse | null>(null);
  const [draft, setDraft] = useState<PlacementDraft | null>(null);
  const [savedDraft, setSavedDraft] = useState<PlacementDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousResult = testData?.previousResult ?? initialPreviousResult;
  const backHref = fromOnboarding ? "/onboarding" : "/learn";
  const signInRedirect = fromOnboarding
    ? "%2Fplacement-test%3Ffrom%3Donboarding"
    : "%2Fplacement-test";

  const storageKey = useMemo(
    () => (userKey ? getPlacementDraftStorageKey(userKey) : null),
    [userKey]
  );

  useEffect(() => {
    if (!storageKey) return;
    // Restoring browser session state is the external-system synchronization for this effect.
    /* eslint-disable react-hooks/set-state-in-effect */
    const restored = parsePlacementDraft(sessionStorage.getItem(storageKey), 12);
    if (restored) {
      setSavedDraft(restored);
      if (!autoStart) setScreen("resume");
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [autoStart, storageKey]);

  const saveDraft = (nextDraft: PlacementDraft) => {
    setDraft(nextDraft);
    if (storageKey) {
      sessionStorage.setItem(storageKey, JSON.stringify(nextDraft));
    }
  };

  const loadQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/placement-test", {
        method: "GET",
        cache: "no-store",
      });
      const body = (await response.json().catch(() => null)) as
        | PlacementTestGetResponse
        | { error?: string }
        | null;

      if (response.status === 401) {
        throw new Error("Bạn cần đăng nhập trước khi bắt đầu bài kiểm tra.");
      }
      if (!response.ok || !body || !("questions" in body)) {
        throw new Error(getErrorMessage(body, "Không thể tải bài kiểm tra."));
      }
      setTestData(body);
      return body;
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải bài kiểm tra."
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const beginNewAttempt = async () => {
    if (!isAuthenticated) return;
    const data = testData ?? (await loadQuestions());
    if (!data) return;

    const nextDraft = createPlacementDraft(crypto.randomUUID());
    saveDraft(nextDraft);
    setSavedDraft(null);
    setScreen("test");
  };

  const continueDraft = async () => {
    const data = testData ?? (await loadQuestions());
    if (!data || !savedDraft) return;
    saveDraft(savedDraft);
    setScreen("test");
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (autoStart && isAuthenticated && !savedDraft && screen === "intro") {
      void beginNewAttempt();
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    // beginNewAttempt is intentionally driven by stable page inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, isAuthenticated, savedDraft, screen]);

  const question =
    testData && draft ? testData.questions[draft.currentQuestionIndex] : null;
  const questionIds = testData?.questions.map((item) => item.id) ?? [];
  const answeredCount = draft
    ? countAnsweredPlacementQuestions(draft.answers, questionIds)
    : 0;

  const updateAnswer = (answer: ExerciseAnswer) => {
    if (!draft || !question) return;
    saveDraft({
      ...draft,
      answers: {
        ...draft.answers,
        [question.id]: answer,
      },
    });
  };

  const moveTo = (index: number) => {
    if (!draft || !testData) return;
    saveDraft({
      ...draft,
      currentQuestionIndex: Math.min(
        Math.max(index, 0),
        testData.questions.length - 1
      ),
    });
  };

  const goToFirstMissing = () => {
    if (!draft || !testData) return;
    const missingIndex = testData.questions.findIndex(
      (item) => !isPlacementAnswerComplete(draft.answers[item.id])
    );
    setReviewOpen(false);
    if (missingIndex >= 0) moveTo(missingIndex);
  };

  const submitTest = async () => {
    if (!draft || !testData || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/placement-test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          submissionId: draft.submissionId,
          testVersion: draft.testVersion,
          startedAt: draft.startedAt,
          answers: testData.questions
            .filter((item) =>
              isPlacementAnswerComplete(draft.answers[item.id])
            )
            .map((item) => ({
              questionId: item.id,
              answer: draft.answers[item.id],
            })),
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(getErrorMessage(body, "Không thể nộp bài lúc này."));
      }

      if (storageKey) sessionStorage.removeItem(storageKey);
      setReviewOpen(false);
      router.push("/placement-test/result");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể nộp bài lúc này. Đáp án của bạn vẫn được giữ lại."
      );
      setReviewOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exitTest = () => {
    setScreen(draft ? "resume" : "intro");
    setSavedDraft(draft);
  };

  if (screen === "intro" || screen === "resume") {
    const latestPresentation = previousResult
      ? getPlacementSectionPresentation(previousResult.latestAssignedSectionId)
      : null;
    const highestPresentation = previousResult
      ? getPlacementSectionPresentation(previousResult.highestAssignedSectionId)
      : null;

    return (
      <main className="min-h-screen overflow-hidden bg-[#f6fbff] px-4 py-6 text-slate-800 dark:bg-[#101a1e] dark:text-slate-100 sm:py-10">
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-24 -top-24 size-80 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-700/15" />
          <div className="absolute -bottom-24 -right-20 size-96 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-800/10" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <header className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" aria-label="Robogo">
              <Image src="/Robogo.svg" alt="Robogo" width={44} height={44} priority />
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                ROBOGO
              </span>
            </Link>
            <Link
              href={backHref}
              className="rounded-xl px-3 py-2 text-sm font-black text-slate-500 transition hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:hover:bg-[#1b292f] dark:hover:text-white"
            >
              Quay lại trang học
            </Link>
          </header>

          <section className="rounded-[2rem] border-2 border-slate-200 bg-white/95 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur dark:border-[#263840] dark:bg-[#152126]/95 sm:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-[0_10px_30px_rgba(14,165,233,0.28)]">
                <BrainCircuit className="size-10" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                <Sparkles className="size-3.5" /> Lộ trình phù hợp với bạn
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Kiểm tra trình độ tiếng Anh
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base font-bold leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
                Hoàn thành 12 câu hỏi để Robogo đề xuất Phần 1, 2 hoặc 3 phù hợp với kiến thức hiện tại của bạn.
              </p>
            </div>

            <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                { icon: Clock3, title: "Khoảng 5 phút", description: "Không giới hạn thời gian" },
                { icon: History, title: "Có thể quay lại", description: "Sửa đáp án trước khi nộp" },
                { icon: ShieldCheck, title: "Không ảnh hưởng XP", description: "Chỉ dùng để xếp trình độ" },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-left dark:border-[#223138] dark:bg-[#111c20]">
                  <Icon className="mb-3 size-5 text-sky-500" />
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100">{title}</p>
                  <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
                </div>
              ))}
            </div>

            {screen === "resume" && savedDraft ? (
              <div className="mx-auto mt-7 max-w-2xl rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <RotateCcw className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" />
                  <div>
                    <p className="font-black text-amber-900 dark:text-amber-100">Bạn có một bài kiểm tra chưa hoàn thành</p>
                    <p className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-300">
                      Tiếp tục từ câu {savedDraft.currentQuestionIndex + 1} hoặc làm lại từ đầu.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Button variant="primary" className="h-12 rounded-2xl" onClick={() => void continueDraft()} disabled={isLoading}>
                    {isLoading ? "Đang tải..." : "Tiếp tục"}
                  </Button>
                  <Button variant="primary-outline" className="h-12 rounded-2xl" onClick={() => void beginNewAttempt()} disabled={isLoading}>
                    Làm lại từ đầu
                  </Button>
                </div>
              </div>
            ) : null}

            {previousResult ? (
              <div className="mx-auto mt-7 max-w-2xl rounded-2xl border-2 border-slate-200 p-5 dark:border-[#263840]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Kết quả gần nhất</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{latestPresentation?.title}</p>
                    <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">{previousResult.totalCorrect}/12 câu đúng • Lần làm thứ {previousResult.attemptCount}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Cấp cao nhất từng đạt</p>
                    <p className="mt-1 font-black text-sky-600 dark:text-sky-300">{highestPresentation?.title}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="mx-auto mt-6 max-w-2xl rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                {error}
              </div>
            ) : null}

            <div className="mx-auto mt-8 max-w-2xl">
              {isAuthenticated ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="primary" className="h-14 rounded-2xl text-base" onClick={() => void beginNewAttempt()} disabled={isLoading}>
                    {isLoading ? "Đang tải..." : previousResult ? "Làm lại bài kiểm tra" : "Bắt đầu kiểm tra"}
                    <ArrowRight className="size-5" />
                  </Button>
                  {previousResult ? (
                    <Button asChild variant="primary-outline" className="h-14 rounded-2xl text-base">
                      <Link href="/placement-test/result">Xem kết quả gần nhất</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="primary-outline" className="h-14 rounded-2xl text-base">
                      <Link href={backHref}>
                        {fromOnboarding ? "Quay lại chọn lộ trình" : "Bắt đầu từ Phần 1"}
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-5 text-center dark:border-sky-900/50 dark:bg-sky-950/20">
                  <p className="font-black text-slate-800 dark:text-slate-100">Đăng nhập để lưu kết quả kiểm tra</p>
                  <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">Bạn vẫn có thể xem thông tin bài kiểm tra trước khi đăng nhập.</p>
                  <Button asChild variant="primary" className="mt-4 h-12 rounded-2xl px-6">
                    <Link href={`/sign-in?redirect=${signInRedirect}`}>
                      <LogIn className="size-5" /> Đăng nhập để bắt đầu
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!testData || !draft || !question) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6fbff] p-6 dark:bg-[#101a1e]">
        <div className="text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="mt-4 font-black text-slate-600 dark:text-slate-300">Đang chuẩn bị bài kiểm tra...</p>
        </div>
      </main>
    );
  }

  const isLastQuestion = draft.currentQuestionIndex === testData.questions.length - 1;

  return (
    <main className="min-h-screen bg-[#f6fbff] text-slate-800 dark:bg-[#101a1e] dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b-2 border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-[#223138] dark:bg-[#111c20]/95">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <button type="button" onClick={exitTest} aria-label="Thoát bài kiểm tra" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#223138] dark:hover:text-slate-200">
            <X className="size-6" />
          </button>
          <PlacementProgress current={draft.currentQuestionIndex + 1} total={testData.questions.length} />
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <section className="flex-1 rounded-[1.75rem] border-2 border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.07)] dark:border-[#263840] dark:bg-[#152126] sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-600 dark:text-sky-300">{question.instruction}</p>
              <p className="mt-1 text-xs font-bold text-slate-400">Câu hỏi không hiển thị đúng/sai cho đến khi bạn nộp bài.</p>
            </div>
            {isPlacementAnswerComplete(draft.answers[question.id]) ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check className="size-3.5" /> Đã trả lời
              </span>
            ) : null}
          </div>
          <PlacementQuestionRenderer question={question} answer={draft.answers[question.id] ?? null} onAnswerChange={updateAnswer} />
        </section>

        {error ? (
          <div className="mt-4 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
            {error} Đáp án của bạn vẫn được giữ lại.
          </div>
        ) : null}

        <footer className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="primary-outline" disabled={draft.currentQuestionIndex === 0 || isSubmitting} onClick={() => moveTo(draft.currentQuestionIndex - 1)} className="h-12 rounded-2xl px-5">
            <ArrowLeft className="size-5" /> Quay lại
          </Button>
          <Button type="button" variant="primary" disabled={isSubmitting} onClick={() => isLastQuestion ? setReviewOpen(true) : moveTo(draft.currentQuestionIndex + 1)} className="h-12 rounded-2xl px-6">
            {isLastQuestion ? "Kiểm tra bài" : "Tiếp theo"}
            {!isLastQuestion ? <ArrowRight className="size-5" /> : null}
          </Button>
        </footer>
      </div>

      <PlacementReviewDialog
        open={reviewOpen}
        answeredCount={answeredCount}
        totalQuestions={testData.questions.length}
        isSubmitting={isSubmitting}
        onClose={() => setReviewOpen(false)}
        onReturnToMissing={goToFirstMissing}
        onSubmit={() => void submitTest()}
      />
    </main>
  );
}
