"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Flame,
  Gamepad2,
  Languages,
  Moon,
  Sparkles,
  Sun,
  Trophy,
} from "lucide-react";

const courseItems = [
  {
    title: "Tiếng Anh",
    description: "Lộ trình cơ bản cho người mới bắt đầu.",
    href: "#courses",
    icon: BookOpen,
  },
  {
    title: "Tiếng Nhật",
    description: "Học bảng chữ cái, từ vựng và mẫu câu thông dụng.",
    href: "#courses",
    icon: Sparkles,
  },
  {
    title: "Tiếng Hàn",
    description: "Luyện từ vựng, phát âm và hội thoại hằng ngày.",
    href: "#courses",
    icon: Trophy,
  },
  {
    title: "Tiếng Trung",
    description: "Làm quen chữ Hán, pinyin và giao tiếp cơ bản.",
    href: "#courses",
    icon: BookOpen,
  },
];

const featureItems = [
  {
    title: "Bài học ngắn",
    description: "Học nhanh trong vài phút, phù hợp người bận.",
    href: "#features",
    icon: BookOpen,
  },
  {
    title: "Streak học thật",
    description: "Ghi nhận thời gian học 15–60 phút mỗi ngày.",
    href: "#streak",
    icon: Flame,
  },
  {
    title: "Nhiệm vụ hằng ngày",
    description: "Tạo cảm giác tiến bộ giống game.",
    href: "#features",
    icon: Gamepad2,
  },
  {
    title: "Theo dõi tiến độ",
    description: "Xem thời gian học, streak và mục tiêu mỗi ngày.",
    href: "#progress",
    icon: BarChart3,
  },
];

const languages = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "ru", label: "Русский" },
];

type Theme = "light" | "dark";

type DropdownItem = {
  title: string;
  description: string;
  href: string;
  icon: ElementType;
};

type MarketingDropdownProps = {
  label: string;
  items: DropdownItem[];
};

export const MarketingDropdown = ({ label, items }: MarketingDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative hidden xl:block">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-14 min-w-[132px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-base font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1D9BF0]/50 hover:bg-sky-50 hover:text-[#1486CC] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {label}
        <ChevronDown
          className={`h-5 w-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-50 mt-4 w-[430px] rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex gap-4 rounded-2xl px-4 py-4 transition-colors hover:bg-sky-50 dark:hover:bg-slate-800"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#1486CC] dark:bg-sky-500/10 dark:text-sky-300">
                    <Icon className="h-6 w-6" />
                  </span>

                  <span>
                    <span className="block text-base font-black text-slate-800 dark:text-white">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500 dark:text-slate-300">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const CourseDropdown = () => {
  return <MarketingDropdown label="Khóa học" items={courseItems} />;
};

export const FeatureDropdown = () => {
  return <MarketingDropdown label="Tính năng" items={featureItems} />;
};

export const LanguageDropdown = () => {
  const languageRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("dinogo-locale") ?? "vi";
    const matchedLanguage =
      languages.find((language) => language.code === savedLanguage) ??
      languages[0];

    setSelectedLanguage(matchedLanguage);
    document.documentElement.lang = matchedLanguage.code;
    document.documentElement.dataset.locale = matchedLanguage.code;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectLanguage = (language: (typeof languages)[number]) => {
    setSelectedLanguage(language);
    setIsOpen(false);

    localStorage.setItem("dinogo-locale", language.code);
    document.documentElement.lang = language.code;
    document.documentElement.dataset.locale = language.code;
    document.cookie = `dinogo_locale=${language.code}; path=/; max-age=31536000`;
  };

  return (
    <div ref={languageRef} className="relative hidden lg:block">
      <button
        id="header-language-button"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex h-14 min-w-[190px] items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 text-base font-black text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1D9BF0]/50 hover:bg-sky-50 hover:text-[#1486CC] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <span className="flex items-center gap-2">
          <Languages className="h-6 w-6 text-[#1486CC]" />
          <span>{selectedLanguage.label}</span>
        </span>

        <ChevronDown
          className={`h-5 w-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label="Chọn ngôn ngữ hiển thị"
          className="absolute right-0 top-full z-50 mt-4 w-[460px] rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="grid grid-cols-2 gap-1">
            {languages.map((language) => {
              const isActive = selectedLanguage.code === language.code;

              return (
                <button
                  key={language.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelectLanguage(language)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-base transition-colors ${
                    isActive
                      ? "bg-sky-50 font-black text-[#1486CC] dark:bg-sky-500/10 dark:text-sky-300"
                      : "font-bold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-black text-[#1486CC] dark:bg-sky-500/10 dark:text-sky-300">
                    {language.label.charAt(0)}
                  </span>
                  <span>{language.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("dinogo-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme: Theme = savedTheme ?? (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("dinogo-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.dataset.theme = nextTheme;
  };

  return (
    <button
      id="header-theme-toggle"
      type="button"
      onClick={handleToggleTheme}
      aria-label="Chuyển chế độ sáng tối"
      className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1D9BF0]/50 hover:bg-sky-50 hover:text-[#1486CC] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 md:flex"
    >
      {theme === "dark" ? (
        <Sun className="h-6 w-6" />
      ) : (
        <Moon className="h-6 w-6" />
      )}
    </button>
  );
};
