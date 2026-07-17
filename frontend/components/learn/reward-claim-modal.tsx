"use client";

import { Gift, Snowflake, X } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  rewardLabel: string;
  onClose: () => void;
};

export const RewardClaimModal = ({ open, rewardLabel, onClose }: Props) => {
  if (!open) return null;

  return (
    <div
      className="reward-claim-modal-backdrop"
      data-reward-claim-modal="freeze"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reward-claim-modal-title"
        className="reward-claim-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="reward-claim-modal__close"
          aria-label="Đóng phần thưởng"
          onClick={onClose}
        >
          <X className="size-4 stroke-[3]" />
        </button>

        <div className="reward-claim-modal__chest" aria-hidden="true">
          <Gift className="reward-claim-modal__chest-icon" />
          <span className="reward-claim-modal__spark reward-claim-modal__spark--one" />
          <span className="reward-claim-modal__spark reward-claim-modal__spark--two" />
          <span className="reward-claim-modal__spark reward-claim-modal__spark--three" />
        </div>

        <div className="reward-claim-modal__freeze" aria-hidden="true">
          <Snowflake className="size-14 stroke-[3]" />
        </div>

        <p className="reward-claim-modal__eyebrow">Rương đã mở!</p>
        <h2 id="reward-claim-modal-title" className="reward-claim-modal__title">
          {rewardLabel}
        </h2>
        <p className="reward-claim-modal__description">
          Freeze sẽ tự động bảo vệ chuỗi học khi bạn bỏ lỡ một ngày.
        </p>

        <button
          type="button"
          className={cn("reward-claim-modal__action")}
          onClick={onClose}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};
