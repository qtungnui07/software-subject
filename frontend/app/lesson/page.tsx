"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, XCircle, Trophy, RefreshCw, Home, Heart } from "lucide-react";

import { LessonHeader } from "@/components/lesson-header";
import { ExitModal } from "@/components/exit-modal";
import { Button } from "@/components/ui/button";
import { lessonNodes } from "@/constants/lessons";
import { StreakNotification } from "@/components/streak/streak-notification";
import type { StreakNotificationInput } from "@/components/streak/streak-data";

// 5 mock questions related to English Communication
const MOCK_QUESTIONS = [
  {
    id: 1,
    question: 'Trong tiếng Anh, từ "Hello" có nghĩa là gì?',
    options: ["Tạm biệt", "Xin chào", "Cảm ơn", "Xin lỗi"],
    correctIndex: 1,
  },
  {
    id: 2,
    question: 'Dịch câu sau sang tiếng Anh: "Chào buổi sáng"',
    options: ["Good morning", "Good evening", "Good night", "Goodbye"],
    correctIndex: 0,
  },
  {
    id: 3,
    question: 'Điền vào chỗ trống: "Nice to ______ you."',
    options: ["see", "meet", "hear", "speak"],
    correctIndex: 1,
  },
  {
    id: 4,
    question: 'Cụm từ "Thank you" trong tiếng Việt nghĩa là gì?',
    options: ["Không có gì", "Cảm ơn", "Tạm biệt", "Xin lỗi"],
    correctIndex: 1,
  },
  {
    id: 5,
    question: 'Dịch câu sau sang tiếng Anh: "Tạm biệt, hẹn gặp lại!"',
    options: [
      "Goodbye, see you again!",
      "Hello, nice to meet you!",
      "Thank you, goodbye!",
      "Good night, see you!",
    ],
    correctIndex: 0,
  },
];

const EARNED_XP_PER_LESSON = 15;

type StreakUpdateResult = {
  status: StreakNotificationInput["status"];
  currentStreak: number;
  longestStreak?: number;
  streakFreezes?: number;
  missedDays?: number;
  usedStreakFreezes?: number;
  earnedXpToday?: number;
};

const LessonContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = parseInt(searchParams.get("id") || "2", 10);

  // Load lesson node
  const lessonNode = lessonNodes.find((node) => node.id === lessonId) || lessonNodes[1];

  // Game/Quiz States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // Streak states
  const [streakResult, setStreakResult] = useState<StreakNotificationInput | null>(null);
  const [earnedXp, setEarnedXp] = useState(EARNED_XP_PER_LESSON);
  const hasCalledStreakRef = useRef(false);

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
  const progress = (currentQuestionIndex / MOCK_QUESTIONS.length) * 100;

  // Call streak update API when lesson is finished
  useEffect(() => {
    if (!isFinished || hasCalledStreakRef.current) return;

    hasCalledStreakRef.current = true;

    const updateStreak = async () => {
      try {
        const response = await fetch("/api/streak/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: String(lessonId),
            earnedXp: EARNED_XP_PER_LESSON,
          }),
        });

        if (!response.ok) return;

        const data = (await response.json()) as StreakUpdateResult;

        setStreakResult({
          status: data.status,
          currentStreak: data.currentStreak,
          longestStreak: data.longestStreak,
          streakFreezes: data.streakFreezes,
          missedDays: data.missedDays,
          usedStreakFreezes: data.usedStreakFreezes,
        });

        if (typeof data.earnedXpToday === "number" && data.earnedXpToday > 0) {
          setEarnedXp(data.earnedXpToday);
        }
      } catch (err) {
        console.warn("Could not update streak:", err);
      }
    };

    updateStreak();
  }, [isFinished, lessonId]);

  // Handle checking the selected answer
  const onCheck = () => {
    if (selectedOption === null) return;

    const correct = selectedOption === currentQuestion.correctIndex;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      setHearts((prev) => Math.max(0, prev - 1));
    }
  };

  // Handle continuing to the next question or finishing
  const onContinue = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Handle keyboard shortcuts (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered || isFinished || hearts === 0) return;
      const key = parseInt(e.key, 10);
      if (key >= 1 && key <= 4 && key <= currentQuestion.options.length) {
        setSelectedOption(key - 1);
      }
      if (e.key === "Enter" && selectedOption !== null) {
        onCheck();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOption, isAnswered, isFinished, hearts, currentQuestionIndex]);

  // Restart lesson
  const onRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setHearts(5);
    setIsFinished(false);
    setCorrectAnswersCount(0);
    setStreakResult(null);
    setEarnedXp(EARNED_XP_PER_LESSON);
    hasCalledStreakRef.current = false;
  };

  // Redirect to learn page
  const redirectToLearn = () => {
    router.push("/learn");
  };

  // Game over state
  if (hearts === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <div className="relative mx-auto mb-6 flex size-32 items-center justify-center">
          <Image
            src="/mascot.svg"
            alt="Mascot"
            width={120}
            height={120}
            className="object-contain grayscale opacity-80"
          />
          <div className="absolute -bottom-1 -right-1 flex size-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-md ring-4 ring-white animate-bounce">
            <Heart className="size-5 fill-current stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-800">Bạn đã hết tim mất rồi!</h1>
        <p className="mt-3 max-w-[400px] text-base font-bold leading-relaxed text-slate-500">
          Đừng nản lòng nhé! Luyện tập nhiều hơn sẽ giúp bạn ghi nhớ lâu hơn. Hãy thử lại nào!
        </p>

        <div className="mt-8 flex w-full max-w-[280px] flex-col gap-3">
          <Button variant="primary" onClick={onRestart} className="h-12 w-full rounded-2xl">
            <RefreshCw className="mr-2 size-4 stroke-[3]" />
            Thử lại bài học
          </Button>

          <Button variant="outline" onClick={redirectToLearn} className="h-12 w-full rounded-2xl border-2 border-slate-200">
            <Home className="mr-2 size-4 stroke-[3]" />
            Quay lại lộ trình
          </Button>
        </div>
      </div>
    );
  }

  // Lesson completed state
  if (isFinished) {
    const accuracy = Math.round((correctAnswersCount / MOCK_QUESTIONS.length) * 100);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <div className="relative mx-auto mb-6 flex size-36 items-center justify-center">
          <Image
            src="/mascot.svg"
            alt="Mascot"
            width={128}
            height={128}
            className="object-contain"
          />
          <div className="absolute -bottom-2 -right-2 flex size-12 items-center justify-center rounded-full bg-yellow-400 text-white shadow-lg ring-4 ring-white">
            <Trophy className="size-6 stroke-[2.5]" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-800 leading-tight">
          Hoàn thành bài học!
        </h1>
        <p className="mt-2 text-base font-bold text-slate-500">
          Bạn đã xuất sắc vượt qua các thử thách của bài học này.
        </p>

        <div className="mt-8 grid w-full max-w-[420px] grid-cols-2 gap-4">
          <div className="flex flex-col items-center rounded-2xl border-2 border-orange-200 bg-orange-50/50 p-4 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wide text-orange-500">XP nhận được</span>
            <span className="mt-1 text-2xl font-black text-orange-600">+{earnedXp} XP</span>
          </div>

          <div className="flex flex-col items-center rounded-2xl border-2 border-green-200 bg-green-50/50 p-4 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wide text-green-500">Độ chính xác</span>
            <span className="mt-1 text-2xl font-black text-green-600">{accuracy}%</span>
          </div>
        </div>

        <div className="mt-8 w-full max-w-[280px]">
          <Button variant="primary" onClick={redirectToLearn} className="h-12 w-full rounded-2xl">
            Tiếp tục lộ trình
          </Button>
        </div>

        {/* Streak notification after lesson completion */}
        <StreakNotification
          result={streakResult}
          autoHideMs={7000}
          onDismiss={() => setStreakResult(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header bài học */}
      <LessonHeader
        title={lessonNode.title}
        progress={progress}
        hearts={hearts}
        onExitClick={() => setIsExitModalOpen(true)}
      />

      {/* Thân bài học (Câu hỏi) */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:py-12">
        <div className="mx-auto flex max-w-[650px] flex-col justify-center gap-6 md:gap-8">
          {/* Mascot nói câu hỏi */}
          <div className="flex items-start gap-4">
            <div className="relative size-16 shrink-0 md:size-20">
              <Image
                src="/mascot.svg"
                alt="Mascot"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative rounded-2xl border-2 border-slate-200 px-4 py-3 shadow-sm md:px-5 md:py-4">
              <span className="absolute left-0 top-6 -translate-x-[9px] rotate-45 border-b-2 border-l-2 border-slate-200 bg-white p-1" />
              <p className="text-base font-black text-slate-700 leading-normal md:text-lg">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Các đáp án */}
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isOptionCorrect = index === currentQuestion.correctIndex;

              return (
                <button
                  key={option}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => setSelectedOption(index)}
                  className={`flex items-center gap-3 w-full rounded-2xl border-2 p-4 text-left font-bold transition hover:bg-slate-50 active:scale-[0.99] disabled:hover:bg-white
                    ${isSelected ? "border-sky-500 bg-sky-50 text-sky-600 shadow-[0_4px_0_#0ea5e9]" : "border-slate-200 text-slate-600 shadow-[0_4px_0_#e2e8f0]"}
                    ${isAnswered && isOptionCorrect ? "!border-green-500 !bg-green-50 !text-green-600 !shadow-[0_4px_0_#22c55e]" : ""}
                    ${isAnswered && isSelected && !isCorrect ? "!border-rose-500 !bg-rose-50 !text-rose-600 !shadow-[0_4px_0_#f43f5e]" : ""}
                  `}
                >
                  {/* Số thứ tự */}
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-lg border text-xs font-extrabold leading-none
                      ${isSelected ? "border-sky-400 bg-sky-200 text-sky-700" : "border-slate-350 bg-slate-100 text-slate-500"}
                      ${isAnswered && isOptionCorrect ? "!border-green-400 !bg-green-200 !text-green-700" : ""}
                      ${isAnswered && isSelected && !isCorrect ? "!border-rose-400 !bg-rose-200 !text-rose-700" : ""}
                    `}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm md:text-base leading-none">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer tương tác khi bấm Kiểm tra / Tiếp tục */}
      <footer
        className={`border-t-2 py-4 px-4 md:py-6 md:px-6
          ${isAnswered ? (isCorrect ? "border-green-200 bg-green-50" : "border-rose-200 bg-rose-50") : "border-slate-200 bg-white"}
        `}
      >
        <div className="mx-auto flex max-w-[840px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {isAnswered ? (
              isCorrect ? (
                <>
                  <CheckCircle2 className="size-8 text-green-500 stroke-[2.5]" />
                  <div>
                    <h4 className="text-base font-black text-green-700">Chính xác!</h4>
                    <p className="text-xs font-bold text-green-600">Tuyệt vời, tiếp tục phát huy nhé.</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="size-8 text-rose-500 stroke-[2.5]" />
                  <div>
                    <h4 className="text-base font-black text-rose-700">Chưa đúng rồi...</h4>
                    <p className="text-xs font-bold text-rose-600">
                      Đáp án đúng là: <span className="font-extrabold">{currentQuestion.options[currentQuestion.correctIndex]}</span>
                    </p>
                  </div>
                </>
              )
            ) : (
              <p className="text-sm font-bold text-slate-400 hidden sm:block">
                Chọn một đáp án đúng rồi bấm Kiểm tra nhé!
              </p>
            )}
          </div>

          <div className="shrink-0">
            {!isAnswered ? (
              <Button
                variant={selectedOption === null ? "default" : "secondary"}
                disabled={selectedOption === null}
                onClick={onCheck}
                className="h-12 w-full rounded-2xl sm:w-40"
              >
                Kiểm tra
              </Button>
            ) : (
              <Button
                variant={isCorrect ? "secondary" : "danger"}
                onClick={onContinue}
                className="h-12 w-full rounded-2xl sm:w-40"
              >
                {currentQuestionIndex === MOCK_QUESTIONS.length - 1 ? "Hoàn thành" : "Tiếp tục"}
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Modal xác nhận thoát */}
      <ExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={redirectToLearn}
      />
    </div>
  );
};

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white text-slate-500">
          <div className="flex flex-col items-center gap-3">
            <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
            <p className="text-sm font-bold">Đang tải bài học...</p>
          </div>
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
