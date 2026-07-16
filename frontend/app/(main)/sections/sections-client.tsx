"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Layers3 } from "lucide-react";
import { toast } from "sonner";

import { SectionCard } from "@/components/sections/section-card";
import type { SectionPageItem } from "@/types/sections-page";

type Props = {
  sections: SectionPageItem[];
  requestedSectionId: string | null;
};

type SelectSectionResponse = {
  success?: boolean;
  error?: string;
  message?: string;
};

export const SectionsClient = ({ sections, requestedSectionId }: Props) => {
  const router = useRouter();
  const [pendingSectionId, setPendingSectionId] = useState<string | null>(null);
  const [highlightedSectionId, setHighlightedSectionId] = useState(
    requestedSectionId,
  );

  useEffect(() => {
    if (!requestedSectionId) return;

    const card = document.getElementById(`section-card-${requestedSectionId}`);
    card?.scrollIntoView({ behavior: "smooth", block: "center" });

    const timer = window.setTimeout(() => {
      setHighlightedSectionId(null);
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [requestedSectionId]);

  const handleSelect = async (section: SectionPageItem) => {
    if (!section.unlocked || pendingSectionId) return;

    if (section.current) {
      router.push("/learn");
      return;
    }

    setPendingSectionId(section.id);
    try {
      const response = await fetch("/api/progress/course/select-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: section.id }),
      });
      const body = (await response.json().catch(() => null)) as
        | SelectSectionResponse
        | null;

      if (!response.ok || !body?.success) {
        throw new Error(
          body?.message ?? body?.error ?? "Không thể chuyển phần học.",
        );
      }

      toast.success(`Đã chuyển sang ${section.title}.`);
      router.push("/learn");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể chuyển phần học. Vui lòng thử lại.",
      );
    } finally {
      setPendingSectionId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl pb-10">
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-black text-slate-500 transition hover:bg-white hover:text-[#1486CC] dark:text-slate-400 dark:hover:bg-[#182226] dark:hover:text-sky-400"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
        Trở về lộ trình
      </Link>

      <section className="mt-4 overflow-hidden rounded-[32px] border-2 border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-sm sm:p-7 dark:border-[#263840] dark:from-[#182226] dark:via-[#182226] dark:to-[#111c20]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-[24px] border-2 border-white bg-white p-2 shadow-sm dark:border-[#263840] dark:bg-[#111c20]">
            <Image
              src="/Robogo.svg"
              alt="Robogo"
              fill
              priority
              className="object-contain p-2"
              sizes="80px"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-sky-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#1486CC] dark:border-[#263840] dark:bg-[#111c20] dark:text-sky-400">
              <Layers3 className="size-4" aria-hidden="true" />
              Các phần học
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-800 dark:text-white sm:text-4xl">
              Chọn phần phù hợp với bạn
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Xem tiến độ, nội dung sắp học và chuyển giữa những phần bạn đã mở khóa.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 space-y-5">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            pending={pendingSectionId === section.id}
            disabled={pendingSectionId !== null}
            highlighted={highlightedSectionId === section.id}
            onSelect={(item) => void handleSelect(item)}
          />
        ))}
      </div>
    </main>
  );
};
