"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/actions/auth";
import Link from "next/link";

const initialState = undefined;

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signupAction, initialState);

  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-violet-400"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Tạo tài khoản
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Đăng ký miễn phí, không cần thẻ tín dụng.
        </p>
      </div>

      {/* Form */}
      <form action={action} className="space-y-5">
        {/* Global error */}
        {state?.message && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-400">{state.message}</p>
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-name"
            className="block text-sm font-medium text-slate-300"
          >
            Họ và tên
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Nguyễn Văn A"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/50 transition"
          />
          {state?.errors?.name && (
            <p className="text-xs text-red-400">{state.errors.name[0]}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block text-sm font-medium text-slate-300"
          >
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/50 transition"
          />
          {state?.errors?.email && (
            <p className="text-xs text-red-400">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-slate-300"
          >
            Mật khẩu
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Tối thiểu 8 ký tự"
            className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/50 transition"
          />
          {state?.errors?.password && (
            <ul className="space-y-0.5">
              {state.errors.password.map((err) => (
                <li key={err} className="text-xs text-red-400 flex items-center gap-1">
                  <span>•</span> {err}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit */}
        <button
          id="signup-submit"
          type="submit"
          disabled={pending}
          className="w-full py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
        >
          {pending ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
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
              Đang tạo tài khoản...
            </>
          ) : (
            "Tạo tài khoản"
          )}
        </button>

        {/* Terms */}
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          Bằng cách đăng ký, bạn đồng ý với{" "}
          <span className="text-slate-400">Điều khoản dịch vụ</span> và{" "}
          <span className="text-slate-400">Chính sách bảo mật</span> của chúng tôi.
        </p>
      </form>

      {/* Footer link */}
      <p className="mt-6 text-center text-sm text-slate-400">
        Đã có tài khoản?{" "}
        <Link
          href="/sign-in"
          className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
        >
          Đăng nhập
        </Link>
      </p>
    </>
  );
}
