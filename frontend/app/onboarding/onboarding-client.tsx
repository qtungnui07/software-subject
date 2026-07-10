"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, GraduationCap, Sparkles, Sprout } from "lucide-react";

import { OnboardingChoiceCard } from "@/components/onboarding/onboarding-choice-card";
import { OnboardingProgressState } from "@/components/onboarding/onboarding-progress-state";
import { OnboardingResetDialog } from "@/components/onboarding/onboarding-reset-dialog";
import { getPlacementDraftStorageKey } from "@/lib/placement-test/placement-draft";
import type {
  CourseOnboardingState,
  OnboardingApiResponse,
} from "@/types/onboarding";

export type OnboardingClientProps = {
  userId: string;
  initialState: CourseOnboardingState;
};

const getErrorMessage = (value: unknown) => {
  if (
    value &&
    typeof value === "object" &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return "Không thể cập nhật lộ trình lúc này.";
};

export default function OnboardingClient({
  userId,
  initialState,
}: OnboardingClientProps) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitChoice = async (choice: "basic" | "placement") => {
    if (isSubmitting) return null;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      const body = (await response.json().catch(() => null)) as
        | OnboardingApiResponse
        | { error?: string }
        | null;

      if (!response.ok || !body || !("onboarding" in body)) {
        throw new Error(getErrorMessage(body));
      }

      setState(body.onboarding);
      return body.onboarding;
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể cập nhật lộ trình lúc này.",
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const chooseBasic = async () => {
    const next = await submitChoice("basic");
    if (!next) return;

    sessionStorage.removeItem(getPlacementDraftStorageKey(userId));
    router.push("/learn?section=english-section-1");
    router.refresh();
  };

  const choosePlacement = async () => {
    const next = await submitChoice("placement");
    if (!next) return;

    router.push("/placement-test?from=onboarding&start=1");
    router.refresh();
  };

  const continuePlacement = () => {
    router.push("/placement-test?from=onboarding");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6fbff] px-4 py-6 text-slate-800 dark:bg-[#101a1e] dark:text-slate-100 sm:py-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-24 size-80 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-700/15" />
        <div className="absolute -bottom-24 -right-20 size-96 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-800/10" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <header className="mb-8 flex items-center gap-3">
          <Image src="/Robogo.svg" alt="Robogo" width={46} height={46} priority />
          <div>
            <p className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              ROBOGO
            </p>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-500">
              Learn smarter
            </p>
          </div>
        </header>

        <section className="rounded-[2rem] border-2 border-slate-200 bg-white/95 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur dark:border-[#263840] dark:bg-[#152126]/95 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-[0_10px_30px_rgba(14,165,233,0.28)]">
              <GraduationCap className="size-10" />
            </div>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
              <Sparkles className="size-3.5" /> Thiết lập lộ trình
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Bạn muốn bắt đầu như thế nào?
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base font-bold leading-7 text-slate-500 dark:text-slate-400 sm:text-lg">
              Chọn học từ nền tảng hoặc hoàn thành 12 câu kiểm tra để Robogo đưa bạn đến đúng trình độ hiện tại.
            </p>
          </div>

          {error ? (
            <div className="mx-auto mt-7 max-w-2xl rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          <div className="mx-auto mt-9 max-w-4xl">
            {state.status === "placement_in_progress" ? (
              <OnboardingProgressState
                disabled={isSubmitting}
                onContinue={continuePlacement}
                onChooseBasic={() => setResetDialogOpen(true)}
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <OnboardingChoiceCard
                  title="Bắt đầu từ cơ bản"
                  description="Phù hợp nếu bạn mới học tiếng Anh hoặc muốn ôn lại những kiến thức nền tảng từ đầu."
                  eyebrow="Phần 1 · Nền tảng"
                  actionLabel={isSubmitting ? "Đang chuẩn bị..." : "Bắt đầu Phần 1"}
                  icon={Sprout}
                  tone="emerald"
                  disabled={isSubmitting}
                  onSelect={() => void chooseBasic()}
                />
                <OnboardingChoiceCard
                  title="Kiểm tra trình độ"
                  description="Hoàn thành 12 câu trong khoảng 5 phút để mở ngay Phần 1, 2 hoặc 3 phù hợp với bạn."
                  eyebrow="Lộ trình cá nhân hóa"
                  actionLabel={isSubmitting ? "Đang chuẩn bị..." : "Làm bài kiểm tra"}
                  icon={BrainCircuit}
                  tone="sky"
                  disabled={isSubmitting}
                  onSelect={() => void choosePlacement()}
                />
              </div>
            )}
          </div>

          <p className="mt-8 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
            Bạn vẫn có thể học lại các phần thấp hơn sau khi hoàn tất thiết lập.
          </p>
        </section>
      </div>

      <OnboardingResetDialog
        open={resetDialogOpen}
        isSubmitting={isSubmitting}
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={() => void chooseBasic()}
      />
    </main>
  );
}
