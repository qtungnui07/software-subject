import Image from "next/image";
import Link from "next/link";
import { BookOpen, Flame, Languages, Sparkles, Users } from "lucide-react";

const footerLinks = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Khóa học", href: "#courses" },
      { label: "Tính năng", href: "#features" },
      { label: "Streak", href: "#streak" },
      { label: "Cộng đồng", href: "#community" },
    ],
  },
  {
    title: "Khóa học",
    links: [
      { label: "Tiếng Anh", href: "#courses" },
      { label: "Tiếng Nhật", href: "#courses" },
      { label: "Tiếng Hàn", href: "#courses" },
      { label: "Tiếng Trung", href: "#courses" },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { label: "Đăng nhập", href: "/sign-in" },
      { label: "Bắt đầu miễn phí", href: "/sign-up" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-12 dark:border-slate-800 dark:bg-slate-950 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[1.2fr_1.8fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo.svg" alt="Robogo logo" height={54} width={54} className="rounded-2xl" />
            <span className="text-3xl font-black text-[#1486CC]">Robogo</span>
          </Link>
          <p className="mt-5 max-w-md text-base font-medium leading-8 text-slate-500 dark:text-slate-300">
            Nền tảng học ngoại ngữ giúp người học duy trì 15–60 phút mỗi ngày bằng bài học ngắn, streak thật và nhiệm vụ giống game.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              [BookOpen, "Bài học ngắn"],
              [Flame, "Streak thật"],
              [Users, "Cộng đồng"],
              [Sparkles, "Học vui hơn"],
            ].map(([Icon, label]) => {
              const TypedIcon = Icon as typeof BookOpen;
              return (
                <span key={label as string} className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-black text-[#1486CC] dark:bg-sky-500/10 dark:text-sky-300">
                  <TypedIcon className="h-4 w-4" />
                  {label as string}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                {group.title}
              </h3>
              <div className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-base font-bold text-slate-600 transition-colors hover:text-[#1486CC] dark:text-slate-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1500px] flex-col gap-4 border-t border-slate-200 pt-6 text-sm font-bold text-slate-400 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <p>© 2026 Robogo. Marketing page demo.</p>
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span>Tiếng Việt · English · 日本語 · 한국어</span>
        </div>
      </div>
    </footer>
  );
};
