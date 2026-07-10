"use client";

import { useRef, useState } from "react";
import { Ear, Play, RotateCcw, Volume2 } from "lucide-react";

import { PlacementChoiceQuestion } from "@/components/placement-test/placement-choice-question";
import { Button } from "@/components/ui/button";
import type { ChoiceExerciseAnswer, ChoiceOption } from "@/types/exercise";

type Props = {
  prompt: string;
  audioSrc?: string;
  spokenText?: string;
  options: ChoiceOption[];
  answer: ChoiceExerciseAnswer | null;
  onAnswerChange: (answer: ChoiceExerciseAnswer) => void;
};

export const PlacementListeningQuestion = ({
  prompt,
  audioSrc,
  spokenText,
  options,
  answer,
  onAnswerChange,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  const playAudio = async () => {
    setAudioError(null);
    setHasPlayed(true);

    if (audioSrc) {
      const audio = audioRef.current ?? new Audio(audioSrc);
      audioRef.current = audio;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setAudioError("Không thể phát tệp âm thanh lúc này.");
      };
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch {
        setAudioError("Trình duyệt đã chặn phát âm thanh.");
      }
      return;
    }

    if (spokenText && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setAudioError("Trình duyệt không thể phát giọng đọc lúc này.");
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    setAudioError(
      "Thiết bị này không hỗ trợ phát âm thanh. Bạn có thể bỏ trống câu này và tiếp tục."
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-5 text-center dark:border-sky-900/60 dark:bg-sky-950/20">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300">
          <Ear className="size-6" />
        </div>
        <p className="mb-4 text-sm font-bold text-slate-600 dark:text-slate-300">
          Nghe đoạn âm thanh rồi chọn đáp án phù hợp.
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={() => void playAudio()}
          disabled={isPlaying}
          className="mx-auto h-12 rounded-2xl px-5"
        >
          {isPlaying ? (
            <Volume2 className="size-5 animate-pulse" />
          ) : hasPlayed ? (
            <RotateCcw className="size-5" />
          ) : (
            <Play className="size-5" />
          )}
          {isPlaying ? "Đang phát" : hasPlayed ? "Nghe lại" : "Phát âm thanh"}
        </Button>
        {audioError ? (
          <p className="mt-4 text-sm font-bold text-rose-600 dark:text-rose-400">
            {audioError}
          </p>
        ) : null}
      </div>
      <PlacementChoiceQuestion
        prompt={prompt}
        options={options}
        answer={answer}
        onAnswerChange={onAnswerChange}
      />
    </div>
  );
};
