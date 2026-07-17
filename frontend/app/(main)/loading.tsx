const PageLoading = () => {
  return (
    <div
      className="mx-auto w-full max-w-6xl animate-pulse space-y-6"
      role="status"
      aria-label="Đang chuyển trang"
    >
      <div className="h-36 rounded-[32px] border-2 border-sky-100 bg-white dark:border-slate-800 dark:bg-slate-900/50" />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 rounded-[28px] border-2 border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="h-6 w-2/5 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-4/5 rounded-full bg-slate-100 dark:bg-slate-800/70" />
          <div className="h-4 w-3/5 rounded-full bg-slate-100 dark:bg-slate-800/70" />
          <div className="grid gap-3 pt-3 sm:grid-cols-2">
            <div className="h-28 rounded-2xl bg-sky-50 dark:bg-slate-800/70" />
            <div className="h-28 rounded-2xl bg-sky-50 dark:bg-slate-800/70" />
          </div>
        </div>

        <div className="h-72 rounded-[28px] border-2 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40" />
      </div>

      <span className="sr-only">Đang tải nội dung trang...</span>
    </div>
  );
};

export default PageLoading;
