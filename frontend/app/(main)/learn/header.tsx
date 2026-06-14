import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  subtitle: string;
};

export const Header = ({ title, subtitle }: Props) => {
  return (
    <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-3 border-b-2 border-slate-100 py-4 text-slate-500">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="rounded-2xl text-slate-400 hover:bg-[#e8f5ff] hover:text-[#1486CC]"
      >
        <Link href="/courses" aria-label="Quay lại danh sách khóa học">
          <ArrowLeft className="h-5 w-5 stroke-[3]" />
        </Link>
      </Button>

      <div className="min-w-0 text-center">
        <h1 className="truncate text-lg font-black text-slate-700 sm:text-xl">
          {title}
        </h1>
        <p className="mt-0.5 truncate text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="h-10 w-10" aria-hidden="true" />
    </div>
  );
};
