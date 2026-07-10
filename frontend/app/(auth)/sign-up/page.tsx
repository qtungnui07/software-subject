"use client";

import { useState, useTransition } from "react";
import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, CheckCircle2 } from "lucide-react";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray(error.errors) &&
    error.errors[0]
  ) {
    const firstError = error.errors[0] as {
      code?: string;
      message?: string;
      longMessage?: string;
      meta?: { paramName?: string };
    };
    const detail = firstError.longMessage || firstError.message || fallback;
    const field = firstError.meta?.paramName ? `${firstError.meta.paramName}: ` : "";
    const code = firstError.code ? ` (${firstError.code})` : "";

    return `${field}${detail}${code}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(undefined);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
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
    if (!hasUpperCase || !hasLowerCase || !hasSpecialChar) {
      setError("Mật khẩu phải đáp ứng đủ các yêu cầu bảo mật.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/local/sign-up", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || "Không thể tạo tài khoản.");
        }

        router.push("/onboarding");
        router.refresh();
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin."));
      }
    });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError(undefined);

    startTransition(async () => {
      try {
        const verifyResult = await signUp.attemptEmailAddressVerification({
          code,
        });

        if (verifyResult.status === "complete" && verifyResult.createdSessionId) {
          await setActive({ session: verifyResult.createdSessionId });
          router.push("/onboarding");
        } else {
          setError("Xác thực chưa hoàn tất. Vui lòng thử lại.");
        }
      } catch (err: unknown) {
        console.error("Clerk verification error:", err);
        setError(getErrorMessage(err, "Mã xác thực không chính xác."));
      }
    });
  };

  const handleSocialLogin = (strategy: "oauth_google" | "oauth_facebook") => {
    if (!isLoaded) return;
    signUp.authenticateWithRedirect({
      strategy,
      redirectUrl: window.location.origin + "/sso-callback",
      redirectUrlComplete: window.location.origin + "/onboarding",
    });
  };

  if (verifying) {
    return (
      <>
        {/* Header */}
        <div className="mb-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Xác thực Email
          </h1>
          <p className="mt-2 text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến <strong>{email}</strong>.
          </p>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
          {error && (
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/30 px-4 py-3.5 shadow-sm">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {error}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="verification-code"
              className="block text-base font-black text-slate-700 dark:text-slate-300"
            >
              Mã xác thực
            </label>
            <input
              id="verification-code"
              type="text"
              required
              placeholder="Nhập mã 6 chữ số"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-2xl border-2 px-4 py-3 text-center text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-lg font-black tracking-[0.5em] focus:outline-none transition-all duration-200 shadow-inner border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-[#8b5cf6] dark:focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !isLoaded}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#6d28d9] active:border-b-2 active:translate-y-[2px] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-base transition-all duration-100 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(139,92,246,0.15)] mt-4 cursor-pointer"
          >
            {isPending ? "Đang xác thực..." : "Xác thực tài khoản"}
          </button>

          <button
            type="button"
            onClick={() => setVerifying(false)}
            className="w-full text-center text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mt-2"
          >
            Quay lại đăng ký
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Tạo tài khoản
        </h1>
        <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
          Tạo hồ sơ và bắt đầu học ngay hôm nay.
        </p>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => handleSocialLogin("oauth_google")}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-bold transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="text-slate-700 dark:text-slate-300 text-sm">Facebook</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center my-3 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <span className="relative bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Hoặc đăng ký bằng email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSignUp} className="space-y-3">
        {/* Global error */}
        {error && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/30 px-4 py-3.5 shadow-sm">
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Name */}
        <div className="space-y-1">
          <label htmlFor="signup-name" className="block text-sm font-black text-slate-700 dark:text-slate-300">
            Họ và tên
          </label>
          <div className="relative">
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              className="w-full rounded-xl border-2 px-4 py-2.5 pl-10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-bold focus:outline-none transition-all duration-200 shadow-inner peer border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-[#8b5cf6] dark:focus:border-violet-500"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none text-slate-400 dark:text-slate-600 peer-focus:text-[#8b5cf6] dark:peer-focus:text-violet-500" />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="signup-email" className="block text-sm font-black text-slate-700 dark:text-slate-300">
            Email
          </label>
          <div className="relative">
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full rounded-xl border-2 px-4 py-2.5 pl-10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-bold focus:outline-none transition-all duration-200 shadow-inner peer border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-[#8b5cf6] dark:focus:border-violet-500"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none text-slate-400 dark:text-slate-600 peer-focus:text-[#8b5cf6] dark:peer-focus:text-violet-500" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="signup-password" className="block text-sm font-black text-slate-700 dark:text-slate-300">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Tối thiểu 8 ký tự, có số & chữ"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 px-4 py-2.5 pl-10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm font-bold focus:outline-none transition-all duration-200 shadow-inner peer border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-[#8b5cf6] dark:focus:border-violet-500"
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none text-slate-400 dark:text-slate-600 peer-focus:text-[#8b5cf6] dark:peer-focus:text-violet-500" />
          </div>

          {/* Password Checklist Grid */}
          <div className="mt-2 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/50">
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
              <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors duration-200 ${hasMinLength ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}>
                {hasMinLength ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-transparent shrink-0" />
                )}
                <span>Tối thiểu 8 ký tự</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors duration-200 ${hasUpperCase ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}>
                {hasUpperCase ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-transparent shrink-0" />
                )}
                <span>1 ký tự viết hoa</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors duration-200 ${hasLowerCase ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}>
                {hasLowerCase ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-transparent shrink-0" />
                )}
                <span>1 ký tự viết thường</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors duration-200 ${hasSpecialChar ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600"}`}>
                {hasSpecialChar ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-transparent shrink-0" />
                )}
                <span>1 ký tự đặc biệt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Captcha mount point */}
        <div id="clerk-captcha" className="my-2" />

        {/* Submit */}
        <button
          id="signup-submit"
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-6 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] border-b-4 border-[#6d28d9] active:border-b-2 active:translate-y-[2px] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm transition-all duration-100 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(139,92,246,0.15)] mt-2 cursor-pointer"
        >
          {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-4 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
        Đã có tài khoản?{" "}
        <Link
          href="/sign-in"
          className="text-[#8b5cf6] hover:text-[#7c3aed] dark:text-violet-400 dark:hover:text-violet-300 font-black transition-colors underline decoration-2 underline-offset-4 ml-1"
        >
          Đăng nhập
        </Link>
      </p>
    </>
  );
}
