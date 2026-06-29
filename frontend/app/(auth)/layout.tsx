import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Xác thực — Robogo",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-y-auto flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white px-4">
      {/* Playful background grid/patterns */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] dark:bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] opacity-60" />
      <div className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 bg-sky-200/40 dark:bg-sky-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Back to Home Button — absolute, top-left corner */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-20 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm px-4 text-sm font-bold text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Trang chủ
      </Link>

      {/* Centered Auth Card Container */}
      <div className="w-full max-w-[460px] mx-auto relative z-10 flex flex-col items-center gap-4 my-auto py-16">
        {/* Mascot Logo */}
        <Link href="/" className="group flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-top-6 duration-500 ease-out fill-mode-both">
          <div className="relative w-16 h-16 transition-transform duration-300 group-hover:scale-110 active:scale-95">
            <Image
              src="/logo.webp"
              alt="Robogo Mascot"
              fill
              priority
              className="object-contain drop-shadow-[0_8px_16px_rgba(29,155,240,0.15)]"
            />
          </div>
          <span className="text-xl font-black tracking-tight text-[#1D9BF0] dark:text-sky-400">
            Robogo
          </span>
        </Link>

        {/* Form Card */}
        <div className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] dark:shadow-none animate-in fade-in slide-in-from-bottom-8 duration-600 ease-out fill-mode-both">
          {children}
        </div>
      </div>
    </div>
  );
}
