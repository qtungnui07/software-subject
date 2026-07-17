"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpenText,
  ChevronDown,
  ChevronUp,
  Headphones,
  MapPinned,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ExerciseContext } from "@/types/exercise";
import type { AssessmentMode } from "@/types/learning-session-draft";

type Props = {
  context: ExerciseContext;
  revealed?: boolean;
  assessmentMode?: AssessmentMode;
};

export const ExerciseContextCard = ({
  context,
  revealed = false,
  assessmentMode = "standard",
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setIsPlaying(false);
      setAudioError("Không thể phát tệp âm thanh lúc này.");
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [context.kind]);

  useEffect(
    () => () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    },
    [],
  );

  const stopPlayback = () => {
    audioRef.current?.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const playListeningContext = async () => {
    if (context.kind !== "listening") return;

    setAudioError(null);

    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (context.audioSrc && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;

      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setAudioError("Trình duyệt đã chặn phát âm thanh. Hãy thử lại.");
      }
      return;
    }

    if (
      context.spokenText &&
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(context.spokenText);
      utterance.lang = "en-US";
      utterance.rate = playbackRate;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setAudioError("Trình duyệt không thể phát giọng đọc lúc này.");
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    setAudioError("Nội dung nghe chưa có nguồn âm thanh hợp lệ.");
  };

  const icon =
    context.kind === "reading" ? (
      <BookOpenText className="size-5" aria-hidden="true" />
    ) : context.kind === "listening" ? (
      <Headphones className="size-5" aria-hidden="true" />
    ) : (
      <MapPinned className="size-5" aria-hidden="true" />
    );

  const label =
    context.kind === "reading"
      ? "Bài đọc"
      : context.kind === "listening"
        ? "Bài nghe"
        : "Tình huống";

  return (
    <section className="overflow-hidden rounded-3xl border-2 border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20">
      <div className="flex min-h-14 items-center gap-3 px-4 py-3 md:px-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#1486CC] dark:bg-sky-900/50 dark:text-sky-300">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-700/80 dark:text-sky-300/80">
            {label}
          </p>
          <h3 className="truncate text-sm font-black text-slate-800 dark:text-slate-100 md:text-base">
            {context.title}
          </h3>
        </div>

        {context.kind !== "listening" ? (
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Thu gọn nội dung" : "Mở nội dung"}
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 border-sky-200 bg-white text-sky-700 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/40 dark:border-sky-900 dark:bg-[#141f23] dark:text-sky-300 dark:hover:bg-[#1f2d33]"
          >
            {isExpanded ? (
              <ChevronUp className="size-5" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-5" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      {context.kind === "reading" && isExpanded ? (
        <div className="border-t-2 border-sky-100 bg-white/80 px-4 py-4 dark:border-sky-950 dark:bg-[#141f23]/80 md:px-5">
          <p className="whitespace-pre-line text-sm font-semibold leading-7 text-slate-700 dark:text-slate-200 md:text-base">
            {context.text}
          </p>
        </div>
      ) : null}

      {context.kind === "scenario" && isExpanded ? (
        <div className="border-t-2 border-sky-100 bg-white/80 px-4 py-4 dark:border-sky-950 dark:bg-[#141f23]/80 md:px-5">
          <p className="text-sm font-semibold leading-7 text-slate-700 dark:text-slate-200 md:text-base">
            {context.description}
          </p>
        </div>
      ) : null}

      {context.kind === "listening" ? (
        <div className="border-t-2 border-sky-100 bg-white/80 px-4 py-4 dark:border-sky-950 dark:bg-[#141f23]/80 md:px-5">
          {assessmentMode === "silent" ? (
            <div className="rounded-2xl border-2 border-sky-100 bg-sky-50 p-4 dark:border-sky-950 dark:bg-sky-950/20">
              <p className="mb-1 text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-300">
                Nội dung thay thế không âm thanh
              </p>
              <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                {context.silentAlternative ??
                  "Nội dung thay thế chưa sẵn sàng."}
              </p>
            </div>
          ) : (
            <>
              {context.audioSrc ? (
                <audio ref={audioRef} src={context.audioSrc} preload="none" />
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="lessonPrimary"
                  onClick={() => void playListeningContext()}
                  className="h-12 rounded-2xl px-5 normal-case tracking-normal sm:min-w-40"
                  aria-label={isPlaying ? "Tạm dừng bài nghe" : "Phát bài nghe"}
                >
                  {isPlaying ? (
                    <Pause className="size-5" aria-hidden="true" />
                  ) : revealed ? (
                    <RotateCcw className="size-5" aria-hidden="true" />
                  ) : (
                    <Play className="size-5" aria-hidden="true" />
                  )}
                  {isPlaying
                    ? "Tạm dừng"
                    : revealed
                      ? "Nghe lại"
                      : "Phát bài nghe"}
                </Button>

                <label className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-black text-slate-600 dark:border-[#202f36] dark:bg-[#182226] dark:text-slate-300 sm:justify-start">
                  Tốc độ
                  <select
                    value={playbackRate}
                    onChange={(event) => {
                      const nextRate = Number(event.target.value);
                      setPlaybackRate(nextRate);
                      if (audioRef.current)
                        audioRef.current.playbackRate = nextRate;
                    }}
                    aria-label="Tốc độ phát bài nghe"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-black text-slate-700 outline-none focus:ring-4 focus:ring-sky-300/40 dark:border-[#2c3d45] dark:bg-[#141f23] dark:text-slate-100"
                  >
                    <option value={0.8}>0.8×</option>
                    <option value={1}>1×</option>
                  </select>
                </label>
              </div>

              {audioError ? (
                <p
                  role="alert"
                  className="mt-3 text-sm font-bold text-rose-600 dark:text-rose-400"
                >
                  {audioError}
                </p>
              ) : null}
            </>
          )}

          {revealed && context.transcriptAfterSubmit ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#202f36] dark:bg-[#182226]">
              <p className="mb-1 text-xs font-black uppercase tracking-wider text-slate-400">
                Transcript
              </p>
              <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                {context.transcriptAfterSubmit}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
