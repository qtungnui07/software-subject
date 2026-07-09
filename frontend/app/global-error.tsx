"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <section style={{ maxWidth: 480, textAlign: "center" }}>
            <h1>Robogo đang gặp sự cố</h1>
            <p>Mã lỗi: {error.digest ?? "không xác định"}</p>
            <button type="button" onClick={reset}>
              Thử lại
            </button>
            <p>
              <a href="/learn">Quay lại trang học</a>
            </p>
          </section>
        </main>
      </body>
    </html>
  );
}
