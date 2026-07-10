"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error", { digest: error.digest });
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Có lỗi xảy ra</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tiến độ đã lưu trước đó vẫn được giữ. Hãy thử tải lại thao tác này.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Mã lỗi: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            Thử lại
          </button>
          <Link href="/learn" className="rounded-xl border px-5 py-3 font-semibold">
            Quay lại trang học
          </Link>
        </div>
      </section>
    </main>
  );
}
