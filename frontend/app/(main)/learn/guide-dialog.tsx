"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BookOpen, CheckCircle2, Clock3, Heart, Trophy, X, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const guideItems = [
  {
    icon: Clock3,
    title: "Học thật mỗi ngày",
    description: "Tích lũy thời gian học để mở chuỗi Đồng, Bạc và Vàng.",
    theme: {
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      text: "text-orange-400",
    },
  },
  {
    icon: CheckCircle2,
    title: "Hoàn thành bài hiện tại",
    description: "Làm bài theo thứ tự để mở khóa các bài tiếp theo trong lộ trình.",
    theme: {
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
    },
  },
  {
    icon: Heart,
    title: "Giữ tim",
    description: "Trả lời cẩn thận. Sai quá nhiều sẽ cần ôn tập lại trước khi tiếp tục.",
    theme: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      text: "text-rose-400",
    },
  },
  {
    icon: Trophy,
    title: "Kiếm XP",
    description: "XP giúp bạn mở khóa bảng xếp hạng và nhiệm vụ nâng cao.",
    theme: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
    },
  },
];

export const GuideDialog = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="primary-outline"
        onClick={() => setOpen(true)}
        className="h-[52px] rounded-2xl px-5 text-[#1486CC] shadow-sm sm:min-w-[148px]"
      >
        <BookOpen className="size-5 stroke-[3]" />
        Hướng dẫn
      </Button>

      {open && mounted ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-md animate-in fade-in-0 duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="learn-guide-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[450px] max-h-[90vh] flex flex-col overflow-hidden rounded-[24px] border-2 border-sky-500/30 bg-[#0f191e]/95 text-slate-100 shadow-[0_0_30px_rgba(20,134,204,0.15)] animate-in fade-in-0 zoom-in-95 duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative border-b-2 border-sky-500/20 px-6 py-5 bg-[#14232a]/80">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-sky-400 shrink-0" />
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-400">
                      Robogo Guide
                    </p>
                  </div>
                  <h2 id="learn-guide-title" className="mt-1.5 text-2xl font-black tracking-tight text-slate-100">
                    Hướng dẫn nhanh
                  </h2>
                  <p className="mt-1 text-xs font-bold leading-normal text-slate-400">
                    Nắm các quy tắc cơ bản trước khi bắt đầu học.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 transition hover:bg-sky-500/20 hover:text-sky-300 active:scale-95 cursor-pointer"
                  aria-label="Đóng hướng dẫn"
                >
                  <X className="size-5 stroke-[3]" />
                </button>
              </div>
            </div>

            <div className="grid gap-3.5 p-5 overflow-y-auto max-h-[calc(90vh-180px)]">
              {guideItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-2xl border border-sky-500/10 bg-[#16272f]/40 hover:bg-[#1c323c]/50 p-4 transition duration-150"
                  >
                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${item.theme.bg} ${item.theme.border} ${item.theme.text} shadow-sm`}>
                      <Icon className="size-5 stroke-[2.5]" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-extrabold text-base text-slate-100 leading-none">{item.title}</h3>
                      <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t-2 border-sky-500/20 p-5 bg-[#14232a]/30">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(14,165,233,0.35)] active:scale-[0.98] transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f191e]"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
};
