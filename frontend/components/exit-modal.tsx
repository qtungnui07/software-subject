"use client";

import Image from "next/image";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const ExitModal = ({ isOpen, onClose, onConfirm }: Props) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] overflow-hidden rounded-[28px] border-2 border-slate-200 dark:border-[#202f36] bg-white dark:bg-[#182226] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.5)] text-center animate-in fade-in zoom-in-95 duration-200"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative mx-auto mb-4 flex size-24 items-center justify-center">
          <Image
            src="/mascot.svg"
            alt="Mascot"
            width={84}
            height={84}
            className="object-contain"
          />
          <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-md ring-4 ring-white dark:ring-[#182226]">
            <AlertTriangle className="size-4 stroke-[3]" />
          </div>
        </div>

        <h2 id="exit-modal-title" className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight">
          Bạn muốn thoát học?
        </h2>

        <p className="mt-3 text-sm font-bold leading-relaxed text-slate-500 dark:text-slate-400">
          Chờ đã! Nếu bạn rời đi bây giờ, mọi tiến độ của bài học hiện tại sẽ bị mất.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="h-12 w-full rounded-2xl"
          >
            Tiếp tục học
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            className="h-12 w-full rounded-2xl"
          >
            Thoát bài
          </Button>
        </div>
      </div>
    </div>
  );
};
