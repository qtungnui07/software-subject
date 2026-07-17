import {
  CheckCircle2,
  CircleGauge,
  CircleX,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type { ExerciseCheckResult } from "@/types/exercise";

const CriteriaList = ({ result }: { result: ExerciseCheckResult }) => {
  if (!result.feedbackCriteria?.length) return null;

  return (
    <ul className="mt-2 grid gap-1.5 text-xs font-bold">
      {result.feedbackCriteria.map((criterion) => (
        <li key={criterion.id} className="flex items-start gap-2">
          {criterion.passed ? (
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-green-500"
              aria-hidden="true"
            />
          ) : (
            <CircleX
              className="mt-0.5 size-4 shrink-0 text-current opacity-80"
              aria-hidden="true"
            />
          )}
          <span>{criterion.label}</span>
        </li>
      ))}
    </ul>
  );
};

type Props = {
  result: ExerciseCheckResult;
  attempts?: number;
  canRetry?: boolean;
  revealCorrectAnswer?: boolean;
  isReviewMode?: boolean;
};

export const ExerciseFeedback = ({
  result,
  attempts = 1,
  canRetry = false,
  revealCorrectAnswer = true,
  isReviewMode = false,
}: Props) => {
  if (result.isCorrect) {
    return (
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 size-8 shrink-0 text-green-500 stroke-[2.5]" />
        <div>
          <h4 className="text-base font-black text-green-700 dark:text-green-400">
            {isReviewMode ? "Đã khắc phục!" : "Chính xác!"}
          </h4>
          <p className="text-xs font-bold leading-relaxed text-green-600 dark:text-green-500">
            {result.feedbackMessage ??
              result.explanation ??
              "Tuyệt vời, tiếp tục phát huy nhé."}
          </p>
          <CriteriaList result={result} />
        </div>
      </div>
    );
  }

  if (result.scoreRatio > 0) {
    return (
      <div className="flex items-start gap-3">
        <CircleGauge className="mt-0.5 size-8 shrink-0 text-amber-500 stroke-[2.5]" />
        <div>
          <h4 className="text-base font-black text-amber-700 dark:text-amber-400">
            Gần đúng rồi — {Math.round(result.scoreRatio * 100)}%
          </h4>
          <p className="text-xs font-bold leading-relaxed text-amber-700/90 dark:text-amber-400/90">
            {result.feedbackMessage ??
              "Một phần câu trả lời đã đúng. Hãy sửa phần còn lại."}
          </p>
          <CriteriaList result={result} />
          {canRetry ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300">
              <RotateCcw className="size-4" aria-hidden="true" />
              Còn một lần sửa mà không mất tim.
            </p>
          ) : null}
          {revealCorrectAnswer ? (
            <p className="mt-2 text-xs font-bold leading-relaxed text-amber-700/90 dark:text-amber-400/90">
              Đáp án mẫu:{" "}
              <span className="font-extrabold">{result.correctAnswerText}</span>
            </p>
          ) : null}
          {result.explanation ? (
            <p className="mt-1 text-xs font-bold leading-relaxed text-amber-700/80 dark:text-amber-400/80">
              {result.explanation}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <XCircle className="mt-0.5 size-8 shrink-0 text-rose-500 stroke-[2.5]" />
      <div>
        <h4 className="text-base font-black text-rose-700 dark:text-rose-400">
          Chưa đúng rồi...
        </h4>
        <p className="text-xs font-bold leading-relaxed text-rose-600 dark:text-rose-500">
          {result.feedbackMessage ??
            (canRetry
              ? "Hãy xem lại gợi ý và thử thêm một lần nữa."
              : "Bạn đã dùng hết lượt thử cho câu này.")}
        </p>
        <CriteriaList result={result} />
        {canRetry ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400">
            <RotateCcw className="size-4" aria-hidden="true" />
            Lần thử {attempts}/2 — bạn vẫn có thể sửa lại.
          </p>
        ) : null}
        {revealCorrectAnswer ? (
          <p className="mt-2 text-xs font-bold leading-relaxed text-rose-600 dark:text-rose-500">
            Đáp án đúng:{" "}
            <span className="font-extrabold dark:text-rose-300">
              {result.correctAnswerText}
            </span>
          </p>
        ) : null}
        {result.explanation ? (
          <p className="mt-1 text-xs font-bold leading-relaxed text-rose-600/90 dark:text-rose-400/90">
            {result.explanation}
          </p>
        ) : null}
      </div>
    </div>
  );
};
