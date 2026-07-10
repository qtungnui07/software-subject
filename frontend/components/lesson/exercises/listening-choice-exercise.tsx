"use client";

import { useRef, useState } from "react";
import { Ear, Play, RotateCcw, Volume2 } from "lucide-react";

import { MultipleChoiceExerciseView } from "@/components/lesson/exercises/multiple-choice-exercise";
import { Button } from "@/components/ui/button";
import type {
  ChoiceExerciseAnswer,
  ExerciseCheckResult,
  ListeningChoiceExercise,
  MultipleChoiceExercise,
} from "@/types/exercise";

type Props = {
  exercise: ListeningChoiceExercise;
  answer: ChoiceExerciseAnswer | null;
  disabled: boolean;
  result: ExerciseCheckResult | null;
  onAnswerChange: (answer: ChoiceExerciseAnswer) => void;
};

export const ListeningChoiceExerciseView = ({
  exercise,
  answer,
  disabled,
  result,
  onAnswerChange,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [showTranscriptFallback, setShowTranscriptFallback] = useState(false);

  const playAudio = async () => {
    setAudioError(null);

    if (exercise.audioSrc) {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(exercise.audioSrc);
          audioRef.current.addEventListener("ended", () => setIsPlaying(false));
          audioRef.current.addEventListener("error", () => {
            setIsPlaying(false);
            setAudioError("Không thể phát tệp âm thanh này.");
          });
        }

        setIsPlaying(true);
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        return;
      } catch {
        setIsPlaying(false);
      }
    }

    if (exercise.spokenText && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(exercise.spokenText);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setAudioError("Trình duyệt không thể phát giọng đọc lúc này.");
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    setAudioError("Trình duyệt không hỗ trợ phát âm thanh.");
  };

  const choiceExercise: MultipleChoiceExercise = {
    ...exercise,
    type: "multiple_choice",
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-5 text-center dark:border-sky-900/60 dark:bg-sky-950/20">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300">
          <Ear className="size-6" />
        </div>
        <p className="mb-4 text-sm font-bold text-slate-600 dark:text-slate-300">
          {exercise.prompt}
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={() => void playAudio()}
          disabled={isPlaying}
          className="mx-auto h-12 rounded-2xl px-5"
        >
          {isPlaying ? <Volume2 className="size-5 animate-pulse" /> : answer ? <RotateCcw className="size-5" /> : <Play className="size-5" />}
          {isPlaying ? "Đang phát" : answer ? "Nghe lại" : "Phát âm thanh"}
        </Button>

        {audioError ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{audioError}</p>
            {exercise.spokenText ? (
              <button
                type="button"
                onClick={() => setShowTranscriptFallback(true)}
                className="text-xs font-black text-sky-700 underline underline-offset-4 dark:text-sky-300"
              >
                Dùng văn bản dự phòng để tiếp tục kiểm thử
              </button>
            ) : null}
          </div>
        ) : null}

        {showTranscriptFallback && exercise.spokenText ? (
          <p className="mt-3 rounded-xl bg-white/80 p-3 text-sm font-black text-slate-700 dark:bg-[#182226]/80 dark:text-slate-200">
            “{exercise.spokenText}”
          </p>
        ) : null}
      </div>

      <MultipleChoiceExerciseView
        exercise={choiceExercise}
        answer={answer}
        disabled={disabled}
        result={result}
        onAnswerChange={onAnswerChange}
      />
    </div>
  );
};
