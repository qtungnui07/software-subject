import Link from "next/link";
import { LockKeyhole, Route } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  sectionTitle: string;
  previousSectionTitle?: string;
  onBack: () => void;
};

export const LockedSectionPanel = ({
  sectionTitle,
  previousSectionTitle,
  onBack,
}: Props) => {
  return (
    <div className="mx-auto my-10 max-w-xl rounded-[28px] border-2 border-slate-200 bg-slate-50 p-6 text-center dark:border-[#263840] dark:bg-[#111c20] sm:p-8">
      <div className="mx-auto flex size-20 items-center justify-center rounded-[24px] bg-slate-200 text-slate-500 dark:bg-[#223138] dark:text-slate-300">
        <LockKeyhole className="size-9" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
        {sectionTitle} chưa được mở
      </h2>
      <p className="mt-3 text-sm font-bold leading-6 text-slate-500 dark:text-slate-400">
        Đạt ít nhất 70% ở checkpoint của {previousSectionTitle ?? "phần trước"},
        hoặc làm bài kiểm tra đầu vào để mở lộ trình phù hợp.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button asChild variant="primary" className="h-12 rounded-2xl">
          <Link href="/placement-test">
            <Route className="size-4" /> Làm kiểm tra đầu vào
          </Link>
        </Button>
        <Button
          type="button"
          variant="primary-outline"
          className="h-12 rounded-2xl"
          onClick={onBack}
        >
          Quay lại phần đang học
        </Button>
      </div>
    </div>
  );
};
