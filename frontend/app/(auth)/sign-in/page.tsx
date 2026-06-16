"use client";

import { useState, useTransition } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export default function SignInPage() {
  const { signIn } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    setError(undefined);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await signIn.create({
          identifier: email,
          password,
        });

        if (result.error) {
          setError(result.error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
          return;
        }

        if (signIn.status === "complete") {
          const finalResult = await signIn.finalize();
          if (finalResult.error) {
            setError(finalResult.error.message || "Lỗi hoàn tất phiên đăng nhập.");
          } else {
            router.push("/learn");
          }
        } else {
          setError("Yêu cầu xác thực thêm chưa được hỗ trợ.");
        }
      } catch (err: any) {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    });
  };

  const handleSocialLogin = (strategy: "oauth_google" | "oauth_facebook") => {
    if (!signIn) return;
    signIn.sso({
      strategy,
      redirectUrl: window.location.origin + "/sso-callback",
      redirectCallbackUrl: window.location.origin + "/learn",
    });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Đăng nhập
        </h1>
        <p className="mt-2 text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
          Chào mừng trở lại! Cùng tiếp tục tích lũy streak ngày hôm nay nào.
        </p>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => handleSocialLogin("oauth_google")}
          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 font-bold transition-all duration-200 active:scale-[0.98] cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-350 delay-100 ease-out fill-mode-both"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.925a5.59 5.59 0 0 1 5.591-5.59c1.454 0 2.782.553 3.79 1.455l3.228-3.228C19.043 3.753 16.697 2.7 13.99 2.7 8.362 2.7 3.8 7.263 3.8 12.89s4.562 10.19 10.19 10.19c5.877 0 9.773-4.132 9.773-9.94 0-.67-.06-1.31-.173-1.855H12.24Z"
            />
          </svg>
          <span className="text-slate-700 dark:text-slate-300 text-sm">Google</span>
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("oauth_facebook")}
          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 font-bold transition-all duration-200 active:scale-[0.98] cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-350 delay-100 ease-out fill-mode-both"
        >
          <svg className="w-5 h-5 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="text-slate-700 dark:text-slate-300 text-sm">Facebook</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center my-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-350 delay-150 ease-out fill-mode-both">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <span className="relative bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Hoặc đăng nhập bằng email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} className="space-y-6">
        {/* Global error */}
        {error && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/30 px-4 py-3.5 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Email */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-350 delay-200 ease-out fill-mode-both">
          <label
            htmlFor="signin-email"
            className="block text-base font-black text-slate-700 dark:text-slate-300"
          >
            Email
          </label>
          <div className="relative">
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full rounded-2xl border-2 px-4 py-3 pl-12 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base font-bold focus:outline-none transition-all duration-200 shadow-inner peer border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-[#1D9BF0] dark:focus:border-sky-500"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors pointer-events-none text-slate-400 dark:text-slate-600 peer-focus:text-[#1D9BF0] dark:peer-focus:text-sky-500" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-350 delay-250 ease-out fill-mode-both">
          <div className="flex items-center justify-between">
            <label
              htmlFor="signin-password"
              className="block text-base font-black text-slate-700 dark:text-slate-300"
            >
              Mật khẩu
            </label>
          </div>
          <div className="relative">
            <input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full rounded-2xl border-2 px-4 py-3 pl-12 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-base font-bold focus:outline-none transition-all duration-200 shadow-inner peer border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-[#1D9BF0] dark:focus:border-sky-500"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors pointer-events-none text-slate-400 dark:text-slate-600 peer-focus:text-[#1D9BF0] dark:peer-focus:text-sky-500" />
          </div>
        </div>

        {/* Submit */}
        <button
          id="signin-submit"
          type="submit"
          disabled={isPending || !signIn}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#1D9BF0] hover:bg-[#1486CC] border-b-4 border-[#0B6FAE] active:border-b-2 active:translate-y-[2px] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-base transition-all duration-100 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(29,155,240,0.15)] mt-4 animate-in fade-in slide-in-from-bottom-2 duration-350 delay-300 ease-out fill-mode-both cursor-pointer"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-1 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-8 text-center text-base font-bold text-slate-500 dark:text-slate-400">
        Chưa có tài khoản?{" "}
        <Link
          href="/sign-up"
          className="text-[#1D9BF0] hover:text-[#1486CC] dark:text-sky-400 dark:hover:text-sky-300 font-black transition-colors underline decoration-2 underline-offset-4 ml-1"
        >
          Đăng ký ngay
        </Link>
      </p>
    </>
  );
}
