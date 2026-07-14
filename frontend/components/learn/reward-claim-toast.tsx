"use client";

import { useEffect } from "react";

import { Snowflake } from "lucide-react";

type Props = {
  message: string | null;
  onDismiss: () => void;
};

export const RewardClaimToast = ({ message, onDismiss }: Props) => {
  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(onDismiss, 2800);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="reward-claim-toast"
      data-reward-claim-toast="freeze"
      role="status"
      aria-live="polite"
    >
      <div className="reward-claim-toast__icon">
        <Snowflake className="size-5 stroke-[3]" />
      </div>
      <p>{message}</p>
    </div>
  );
};
