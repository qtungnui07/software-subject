"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Tài khoản", href: "/settings/account", active: false },
  { label: "Cài đặt riêng", href: "/settings/account", active: true },
  { label: "Cài đặt quyền riêng tư", href: "/settings/account", active: false },
];

const Switch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[30px] w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none cursor-pointer ${
        checked
          ? "bg-[#1486CC] dark:bg-[#1486CC]"
          : "bg-slate-200 dark:bg-[#202f36]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[26px] w-[26px] transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
};

export default function SettingsAccountPage() {
  const [soundEffects, setSoundEffects] = useState(true);
  const [motivation, setMotivation] = useState(true);
  const [listening, setListening] = useState(true);
  const [themeMode, setThemeMode] = useState<"system" | "dark" | "light">("system");

  // Load settings from localStorage on client-side mount
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem("robogo-theme") as "dark" | "light" | null;
    if (savedTheme === "dark") {
      setThemeMode("dark");
    } else if (savedTheme === "light") {
      setThemeMode("light");
    } else {
      setThemeMode("system");
    }

    // Toggle states
    const savedSound = localStorage.getItem("setting-sound") !== "false";
    const savedMotivation = localStorage.getItem("setting-motivation") !== "false";
    const savedListening = localStorage.getItem("setting-listening") !== "false";

    setSoundEffects(savedSound);
    setMotivation(savedMotivation);
    setListening(savedListening);
  }, []);

  const handleToggle = (
    key: string,
    value: boolean,
    setter: (val: boolean) => void
  ) => {
    setter(value);
    localStorage.setItem(key, String(value));
  };

  const handleThemeChange = (mode: "system" | "dark" | "light") => {
    setThemeMode(mode);

    let resolvedTheme: "dark" | "light" = "light";
    if (mode === "system") {
      localStorage.setItem("robogo-theme", "system");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      resolvedTheme = prefersDark ? "dark" : "light";
    } else {
      localStorage.setItem("robogo-theme", mode);
      resolvedTheme = mode;
    }

    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.dataset.theme = resolvedTheme;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Left Column: Cấu hình cài đặt riêng */}
        <div className="space-y-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
              Cài đặt riêng
            </h1>
            <p className="mt-2 text-sm font-bold text-slate-400">
              Cấu hình các tùy chọn học tập (Beta) và giao diện hiển thị của bạn.
            </p>
          </div>

          {/* Section 1: Cài đặt trải nghiệm học */}
          <section className="space-y-6">
            <h2 className="border-b-2 border-slate-100 pb-3 text-lg font-black tracking-wide text-slate-700 dark:border-[#202f36] dark:text-slate-200">
              Cài đặt trải nghiệm học
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-[#202f36]/40">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100 sm:text-base">
                    Hiệu ứng âm thanh
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    Phát âm thanh khi trả lời đúng hoặc sai.
                  </p>
                </div>
                <Switch
                  checked={soundEffects}
                  onChange={(val) => handleToggle("setting-sound", val, setSoundEffects)}
                />
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-[#202f36]/40">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100 sm:text-base">
                    Thông báo khích lệ
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    Nhận các thông báo động viên trong quá trình học.
                  </p>
                </div>
                <Switch
                  checked={motivation}
                  onChange={(val) =>
                    handleToggle("setting-motivation", val, setMotivation)
                  }
                />
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-[#202f36]/40">
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100 sm:text-base">
                    Bài tập nghe
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    Bao gồm các câu hỏi nghe trong các bài học.
                  </p>
                </div>
                <Switch
                  checked={listening}
                  onChange={(val) =>
                    handleToggle("setting-listening", val, setListening)
                  }
                />
              </div>
            </div>
          </section>

          {/* Section 2: Giao diện */}
          <section className="space-y-6">
            <h2 className="border-b-2 border-slate-100 pb-3 text-lg font-black tracking-wide text-slate-700 dark:border-[#202f36] dark:text-slate-200">
              Giao diện
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-800 dark:text-slate-100">
                Chế độ tối
              </label>
              <div className="relative max-w-md">
                <select
                  value={themeMode}
                  onChange={(e) => handleThemeChange(e.target.value as any)}
                  className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-black text-slate-800 shadow-sm outline-none transition focus:border-[#1486CC] dark:border-[#202f36] dark:bg-[#141f23] dark:text-white"
                >
                  <option value="system">Mặc định theo hệ thống</option>
                  <option value="dark">Bật</option>
                  <option value="light">Tắt</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Menu Cài đặt & Hỗ trợ */}
        <div className="space-y-6">
          {/* Card 1: Cài đặt */}
          <div className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-[#202f36] dark:bg-[#141f23]">
            <div className="flex flex-col gap-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-xl px-4 py-3.5 text-sm transition-colors ${
                    link.active
                      ? "bg-slate-100 font-black text-[#1486CC] dark:bg-[#1f2d33] dark:text-white"
                      : "font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1486CC] dark:text-[#afbfcb] dark:hover:bg-[#1f2d33]/50 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Card 2: Hỗ trợ */}
          <div className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-[#202f36] dark:bg-[#141f23]">
            <p className="px-4 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Hỗ trợ
            </p>
            <div className="mt-3 flex flex-col gap-y-1">
              <Link
                href="/learn"
                className="rounded-xl px-4 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1486CC] dark:text-[#afbfcb] dark:hover:bg-[#1f2d33]/50 dark:hover:text-white"
              >
                Trung tâm trợ giúp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
