import Image from "next/image";
import { CheckCircle2, Home, RefreshCw, Trophy, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type LessonResultScreenProps = {
  lessonTitle: string;
  isCheckpoint: boolean;
  passed: boolean;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  accuracy: number;
  passThreshold: number;
  xpEarned: number;
  isWaitingForXp: boolean;
  xpStatusMessage?: string | null;
  completionBlocked?: boolean;
  totalXp?: string | number;
  level?: string | number;
  alreadyClaimed?: boolean;
  onContinue: () => void;
  onRestart: () => void;
  onBackToLearn: () => void;
};

export const LessonResultScreen = ({
  lessonTitle,
  isCheckpoint,
  passed,
  correctAnswers,
  wrongAnswers,
  totalQuestions,
  accuracy,
  passThreshold,
  xpEarned,
  isWaitingForXp,
  xpStatusMessage,
  completionBlocked = false,
  totalXp = "--",
  level = "--",
  alreadyClaimed = false,
  onContinue,
  onRestart,
  onBackToLearn,
}: LessonResultScreenProps) => {
  const resultTitle = passed
    ? completionBlocked
      ? "Hoàn thành lượt luyện tập"
      : isCheckpoint
        ? "Hoàn thành Chương 1!"
        : "Hoàn thành bài học!"
    : isCheckpoint
      ? "Chưa vượt qua kiểm tra cuối chương"
      : "Chưa đạt bài học này";

  const resultDescription = passed
    ? completionBlocked
      ? "Bạn đã hoàn thành lượt luyện tập này, nhưng node này chưa mở trên lộ trình nên tiến độ không thay đổi."
      : isCheckpoint
        ? "Bạn đã vượt qua bài kiểm tra cuối chương. Chương 1 đã đạt 100%."
        : "Bài học đã được tính hoàn thành. Bài tiếp theo đã sẵn sàng trên lộ trình."
    : isCheckpoint
      ? `Cần đạt tối thiểu ${passThreshold}% để hoàn thành Chương 1. Hãy thử lại bài kiểm tra.`
      : `Cần đạt tối thiểu ${passThreshold}% để mở khóa bước tiếp theo. Hãy thử lại một lượt nữa.`;

  const badgeClasses = passed
    ? "bg-green-500 text-white ring-green-100 dark:ring-green-950/40"
    : "bg-rose-500 text-white ring-rose-100 dark:ring-rose-950/40";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#182226] px-4 py-10 text-center text-slate-800 dark:text-slate-100">
      <div className="relative mx-auto mb-6 flex size-36 items-center justify-center">
        <Image
          src={passed ? "/robot-happy-v4.png" : "/robot-sad-v4.png"}
          alt="Mascot"
          width={128}
          height={128}
          className={passed ? "object-contain animate-robot-bounce" : "object-contain grayscale opacity-90 animate-robot-sad"}
        />
        <div className={`absolute -bottom-2 -right-2 flex size-12 items-center justify-center rounded-full shadow-lg ring-4 ring-white dark:ring-[#182226] ${badgeClasses}`}>
          {passed ? <Trophy className="size-6 stroke-[2.5]" /> : <XCircle className="size-6 stroke-[2.5]" />}
        </div>
      </div>

      <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-sky-500 dark:text-sky-400">
        {lessonTitle}
      </p>
      <h1 className="max-w-[640px] text-3xl font-black leading-tight text-slate-800 dark:text-slate-100 md:text-4xl">
        {resultTitle}
      </h1>
      <p className="mt-3 max-w-[520px] text-base font-bold leading-relaxed text-slate-500 dark:text-slate-400">
        {resultDescription}
      </p>

      <div className="mt-8 grid w-full max-w-[640px] grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex flex-col items-center rounded-2xl border-2 border-green-200 dark:border-green-950/40 bg-green-50/50 dark:bg-green-950/10 p-4 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wide text-green-500 dark:text-green-400">Câu đúng</span>
          <span className="mt-1 text-2xl font-black text-green-600 dark:text-green-300">
            {correctAnswers}/{totalQuestions}
          </span>
        </div>

        <div className="flex flex-col items-center rounded-2xl border-2 border-rose-200 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-950/10 p-4 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wide text-rose-500 dark:text-rose-400">Câu sai</span>
          <span className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-300">{wrongAnswers}</span>
        </div>

        <div className="flex flex-col items-center rounded-2xl border-2 border-sky-200 dark:border-sky-950/40 bg-sky-50/50 dark:bg-sky-950/10 p-4 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wide text-sky-500 dark:text-sky-400">Độ chính xác</span>
          <span className="mt-1 text-2xl font-black text-sky-600 dark:text-sky-300">{accuracy}%</span>
        </div>

        <div className="flex flex-col items-center rounded-2xl border-2 border-orange-200 dark:border-orange-950/40 bg-orange-50/50 dark:bg-orange-950/10 p-4 shadow-sm">
          <span className="text-xs font-black uppercase tracking-wide text-orange-500 dark:text-orange-400">XP</span>
          <span className="mt-1 text-2xl font-black text-orange-600 dark:text-orange-300">
            {passed && !completionBlocked ? (isWaitingForXp ? "Đang tính..." : `+${xpEarned} XP`) : "+0 XP"}
          </span>
        </div>
      </div>

      {passed && !completionBlocked ? (
        <div className="mt-4 grid w-full max-w-[420px] grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-slate-200 dark:border-[#202f36] bg-slate-50 dark:bg-[#141f23] px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">Tổng XP</p>
            <p className="mt-1 text-lg font-black text-slate-700 dark:text-slate-200">{totalXp}</p>
          </div>
          <div className="rounded-2xl border-2 border-slate-200 dark:border-[#202f36] bg-slate-50 dark:bg-[#141f23] px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400 dark:text-slate-500">Level</p>
            <p className="mt-1 text-lg font-black text-slate-700 dark:text-slate-200">Level {level}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 min-h-6 max-w-[520px] px-4 text-sm font-bold text-slate-500 dark:text-slate-400">
        {passed
          ? completionBlocked
            ? xpStatusMessage
            : isWaitingForXp
              ? "Đang cập nhật XP và streak..."
              : xpStatusMessage
          : isCheckpoint
            ? "Checkpoint chưa hoàn thành. Tiến độ Chương 1 được giữ nguyên."
            : "Không cập nhật tiến độ, XP hoặc streak khi chưa đạt điều kiện pass."}
      </div>

      {alreadyClaimed && !completionBlocked ? (
        <p className="mt-2 max-w-[460px] rounded-2xl border-2 border-slate-200 dark:border-[#202f36] bg-slate-50 dark:bg-[#141f23] px-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400">
          Bài học này đã nhận XP trước đó, nên hệ thống không cộng XP lần hai.
        </p>
      ) : null}

      {!passed ? (
        <p className="mt-2 max-w-[460px] rounded-2xl border-2 border-rose-200 dark:border-rose-950/40 bg-rose-50 dark:bg-rose-950/10 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-450">
          Kết quả hiện tại chưa mở khóa node tiếp theo. Tiến độ lộ trình được giữ nguyên.
        </p>
      ) : null}
      {completionBlocked ? (
        <p className="mt-2 max-w-[460px] rounded-2xl border-2 border-amber-200 dark:border-amber-950/40 bg-amber-50 dark:bg-amber-950/10 px-4 py-3 text-sm font-bold text-amber-700 dark:text-amber-400">
          Đây là lượt luyện tập ngoài thứ tự hiện tại. Không cộng XP, không cập nhật streak và không mở khóa node tiếp theo.
        </p>
      ) : null}

      <div className="mt-8 flex w-full max-w-[360px] flex-col gap-3">
        {passed ? (
          <Button variant="primary" onClick={onContinue} className="h-12 w-full rounded-2xl">
            <CheckCircle2 className="mr-2 size-4 stroke-[3]" />
            Tiếp tục lộ trình
          </Button>
        ) : (
          <Button variant="danger" onClick={onRestart} className="h-12 w-full rounded-2xl">
            <RefreshCw className="mr-2 size-4 stroke-[3]" />
            Học lại
          </Button>
        )}

        <Button variant="outline" onClick={onBackToLearn} className="h-12 w-full rounded-2xl border-2 border-slate-200 dark:border-[#202f36] dark:text-slate-200 dark:hover:bg-[#202f36]/40">
          <Home className="mr-2 size-4 stroke-[3]" />
          Quay lại lộ trình
        </Button>
      </div>
    </div>
  );
};
