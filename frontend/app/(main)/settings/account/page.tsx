"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getUserAccountDetails, updateUserAccountSettings } from "@/actions/user-progress";

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
      className={`relative inline-flex h-[30px] w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
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
  const [activeTab, setActiveTab] = useState<"account" | "preferences" | "privacy">("account");
  
  // Preferences State
  const [soundEffects, setSoundEffects] = useState(true);
  const [motivation, setMotivation] = useState(true);
  const [listening, setListening] = useState(true);
  const [themeMode, setThemeMode] = useState<"system" | "dark" | "light">("system");

  // Account State
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isClerk, setIsClerk] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings & details on mount
  useEffect(() => {
    // Theme & Preferences
    const savedTheme = localStorage.getItem("robogo-theme") as "dark" | "light" | null;
    if (savedTheme === "dark") {
      setThemeMode("dark");
    } else if (savedTheme === "light") {
      setThemeMode("light");
    } else {
      setThemeMode("system");
    }

    const savedSound = localStorage.getItem("setting-sound") !== "false";
    const savedMotivation = localStorage.getItem("setting-motivation") !== "false";
    const savedListening = localStorage.getItem("setting-listening") !== "false";

    setSoundEffects(savedSound);
    setMotivation(savedMotivation);
    setListening(savedListening);

    // Fetch account details
    getUserAccountDetails()
      .then((data) => {
        setUserName(data.name);
        setUserEmail(data.email);
        setIsClerk(data.isClerk);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Không thể tải thông tin tài khoản");
        setIsLoading(false);
      });
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
    const applyTheme = () => {
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

    // @ts-ignore
    if (!document.startViewTransition) {
      applyTheme();
      return;
    }

    // @ts-ignore
    document.startViewTransition(() => {
      applyTheme();
    });
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast.error("Tên hiển thị không được để trống!");
      return;
    }
    if (!userEmail.trim()) {
      toast.error("Email không được để trống!");
      return;
    }
    setIsSaving(true);
    try {
      await updateUserAccountSettings(userName.trim(), userEmail.trim());
      toast.success("Cập nhật tài khoản thành công!");
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi");
    } finally {
      setIsSaving(false);
    }
  };

  const navLinks = [
    { id: "account", label: "Tài khoản" },
    { id: "preferences", label: "Cài đặt riêng" },
    { id: "privacy", label: "Cài đặt quyền riêng tư" },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Left Column: Forms */}
        <div className="space-y-10">
          {activeTab === "account" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
                  Cấu hình tài khoản
                </h1>
                <p className="mt-2 text-sm font-bold text-slate-400">
                  Cập nhật thông tin đăng nhập và liên lạc của bạn.
                </p>
              </div>

              <section className="space-y-6">
                <h2 className="border-b-2 border-slate-100 pb-3 text-lg font-black tracking-wide text-slate-700 dark:border-[#202f36] dark:text-slate-200">
                  Thông tin cá nhân
                </h2>

                {isLoading ? (
                  <div className="py-10 text-center font-bold text-slate-400">Đang tải thông tin...</div>
                ) : (
                  <form onSubmit={handleSaveAccount} className="space-y-6 max-w-xl">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-800 dark:text-slate-100">
                        Tên hiển thị
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-[#1486CC] dark:border-[#202f36] dark:bg-[#141f23] dark:text-white"
                        placeholder="Nhập tên hiển thị..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-800 dark:text-slate-100">
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        disabled={isClerk}
                        className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 shadow-sm outline-none transition focus:border-[#1486CC] dark:border-[#202f36] dark:bg-[#141f23] dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
                        placeholder="Nhập email..."
                        required
                      />
                      {isClerk && (
                        <p className="text-xs font-semibold text-slate-400">
                          Email của tài khoản liên kết với Clerk không thể thay đổi tại đây.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-800 dark:text-slate-100">
                        Phương thức đăng nhập
                      </label>
                      <div className="flex items-center gap-2 rounded-2xl border-2 border-slate-100 dark:border-[#202f36] p-4 bg-slate-50/50 dark:bg-slate-900/30">
                        <span className="text-xs font-black uppercase tracking-wider px-2 py-1 rounded bg-[#e8f5ff] text-[#1486CC] dark:bg-slate-800 dark:text-sky-400">
                          {isClerk ? "Clerk Auth" : "Local Account"}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {isClerk ? "Đăng nhập nhanh qua tài khoản mạng xã hội hoặc Clerk" : "Tài khoản cục bộ bảo mật trên hệ thống"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full sm:w-auto h-12 rounded-2xl bg-[#1486CC] text-white px-6 font-black uppercase tracking-wider text-sm shadow-[0_4px_0_#106BA3] hover:bg-[#1486CC]/95 active:translate-y-px active:shadow-none transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </form>
                )}
              </section>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-8">
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
          )}

          {activeTab === "privacy" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white sm:text-4xl">
                  Cài đặt quyền riêng tư
                </h1>
                <p className="mt-2 text-sm font-bold text-slate-400">
                  Quản lý cách thông tin và tiến độ của bạn hiển thị với người khác.
                </p>
              </div>

              <section className="space-y-6">
                <h2 className="border-b-2 border-slate-100 pb-3 text-lg font-black tracking-wide text-slate-700 dark:border-[#202f36] dark:text-slate-200">
                  Tùy chọn hiển thị
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-[#202f36]/40">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100 sm:text-base">
                        Hồ sơ công khai
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        Cho phép người dùng khác tìm kiếm và xem tiến độ học của bạn.
                      </p>
                    </div>
                    <Switch
                      checked={true}
                      onChange={() => toast.info("Tính năng riêng tư đang được phát triển!")}
                    />
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-[#202f36]/40">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100 sm:text-base">
                        Chia sẻ hoạt động
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        Hiển thị các bài học vừa hoàn thành trên bảng tin bạn bè.
                      </p>
                    </div>
                    <Switch
                      checked={false}
                      onChange={() => toast.info("Tính năng riêng tư đang được phát triển!")}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Right Column: Menu Cài đặt & Hỗ trợ */}
        <div className="lg:sticky lg:top-8 space-y-6">
          {/* Card 1: Cài đặt */}
          <div className="rounded-[24px] border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-[#202f36] dark:bg-[#141f23]">
            <div className="flex flex-col gap-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full text-left rounded-xl px-4 py-3.5 text-sm transition-colors cursor-pointer ${
                    activeTab === link.id
                      ? "bg-slate-100 font-black text-[#1486CC] dark:bg-[#1f2d33] dark:text-white"
                      : "font-bold text-slate-600 hover:bg-slate-50 hover:text-[#1486CC] dark:text-[#afbfcb] dark:hover:bg-[#1f2d33]/50 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </button>
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
