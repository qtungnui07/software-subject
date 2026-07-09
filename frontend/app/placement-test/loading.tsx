export default function PlacementTestLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6fbff] p-6 dark:bg-[#101a1e]">
      <div className="text-center">
        <div className="mx-auto size-11 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        <p className="mt-4 font-black text-slate-600 dark:text-slate-300">
          Đang tải bài kiểm tra...
        </p>
      </div>
    </main>
  );
}
