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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white relative py-16 md:py-24 px-4 overflow-y-auto">
      {/* Playful background grid/patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] dark:bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] opacity-60 pointer-events-none" />
      
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-200/40 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-200/40 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-500 dark:text-slate-400"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Trang chủ
      </Link>

      {/* Centered Auth Card Container */}
      <div className="w-full max-w-[460px] relative z-10 flex flex-col items-center gap-6">
        {/* Mascot Logo */}
        <Link href="/" className="group flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-6 duration-500 ease-out fill-mode-both">
          <div className="relative w-24 h-24 transition-transform duration-300 group-hover:scale-110 active:scale-95">
            <Image
              src="/logo.webp"
              alt="Robogo Mascot"
              fill
              priority
              className="object-contain drop-shadow-[0_8px_16px_rgba(29,155,240,0.15)]"
            />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#1D9BF0] dark:text-sky-400">
            Robogo
          </span>
        </Link>

        {/* Form Card */}
        <div className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2.2rem] p-8 md:p-10 shadow-[0_12px_40px_rgba(15,23,42,0.04)] dark:shadow-none animate-in fade-in slide-in-from-bottom-8 duration-600 ease-out fill-mode-both">
          {children}
        </div>
      </div>
    </div>
  );
}
