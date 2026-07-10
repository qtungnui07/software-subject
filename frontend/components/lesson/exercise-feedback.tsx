import { CheckCircle2, XCircle } from "lucide-react";

import type { ExerciseCheckResult } from "@/types/exercise";

type Props = {
  result: ExerciseCheckResult;
};

export const ExerciseFeedback = ({ result }: Props) => {
  if (result.isCorrect) {
    return (
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 size-8 shrink-0 text-green-500 stroke-[2.5]" />
        <div>
          <h4 className="text-base font-black text-green-700 dark:text-green-400">
            Chính xác!
          </h4>
          <p className="text-xs font-bold leading-relaxed text-green-600 dark:text-green-500">
            {result.explanation ?? "Tuyệt vời, tiếp tục phát huy nhé."}
          </p>
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
          Đáp án đúng: <span className="font-extrabold dark:text-rose-300">{result.correctAnswerText}</span>
        </p>
        {result.explanation ? (
          <p className="mt-1 text-xs font-bold leading-relaxed text-rose-600/90 dark:text-rose-400/90">
            {result.explanation}
          </p>
        ) : null}
      </div>
    </div>
  );
};
