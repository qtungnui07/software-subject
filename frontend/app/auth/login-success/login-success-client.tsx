"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  destination: string;
};

export const LoginSuccessClient = ({ destination }: Props) => {
  const router = useRouter();

  useEffect(() => {
    const toastId = toast.success("Đăng nhập thành công!", {
      description: "Chào mừng bạn quay trở lại Robogo.",
      duration: 1_200,
    });
    const redirectTimer = window.setTimeout(() => {
      router.replace(destination);
      router.refresh();
    }, 1_450);

    return () => {
      window.clearTimeout(redirectTimer);
      toast.dismiss(toastId);
    };
  }, [destination, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="size-10 animate-spin rounded-full border-4 border-sky-100 border-t-sky-500 dark:border-slate-800 dark:border-t-sky-400" />
        <p className="font-bold text-slate-500 dark:text-slate-400">
          Đang chuyển tới trang của bạn...
        </p>
      </div>
    </main>
  );
};
