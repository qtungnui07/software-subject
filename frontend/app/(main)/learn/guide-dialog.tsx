"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, Clock3, Heart, Trophy, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const guideItems = [
  {
    icon: Clock3,
    title: "Học thật mỗi ngày",
    description: "Tích lũy thời gian học để mở chuỗi Đồng, Bạc và Vàng.",
  },
  {
    icon: CheckCircle2,
    title: "Hoàn thành bài hiện tại",
    description: "Làm bài theo thứ tự để mở khóa các bài tiếp theo trong lộ trình.",
  },
  {
    icon: Heart,
    title: "Giữ tim",
    description: "Trả lời cẩn thận. Sai quá nhiều sẽ cần ôn tập lại trước khi tiếp tục.",
  },
  {
    icon: Trophy,
    title: "Kiếm XP",
    description: "XP giúp bạn mở khóa bảng xếp hạng và nhiệm vụ nâng cao.",
  },
];

export const GuideDialog = () => {
  const [open, setOpen] = useState(false);

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

      {open ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="learn-guide-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[520px] overflow-hidden rounded-[28px] border-2 border-sky-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-[#1D9BF0] px-6 py-5 text-white">
              <div className="pointer-events-none absolute -right-10 -top-12 size-32 rounded-full bg-white/15" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-100">
                    Robogo Guide
                  </p>
                  <h2 id="learn-guide-title" className="mt-1 text-2xl font-black">
                    Cách học trong lộ trình
                  </h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-sky-50">
                    Hoàn thành bài học, giữ tim và tích lũy thời gian học thật để nâng chuỗi mỗi ngày.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Đóng hướng dẫn"
                >
                  <X className="size-5 stroke-[3]" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 p-5">
              {guideItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-4"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1486CC] shadow-sm">
                      <Icon className="size-6 stroke-[3]" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-700">{item.title}</h3>
                      <p className="mt-1 text-sm font-bold leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t-2 border-slate-100 p-5">
              <Button
                type="button"
                variant="primary"
                onClick={() => setOpen(false)}
                className="h-12 w-full rounded-2xl"
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
