"use client";

import { useClerk } from "@clerk/nextjs";

export const HeaderSignOutButton = () => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/local/sign-out", { method: "POST" });
    } catch (e) {
      console.error("Local sign out error:", e);
    }
    try {
      await signOut();
    } catch (e) {
      console.error("Clerk sign out error:", e);
    }
    window.location.href = "/";
  };

  return (
    <button
      id="header-signout-btn"
      onClick={handleSignOut}
      className="rounded-2xl px-4 py-3 text-base font-black text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
    >
      Đăng xuất
    </button>
  );
};
