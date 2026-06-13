import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
};

export const Header = ({ title }: Props) => {
  return (
    <div className="flex items-center justify-between border-b-2 border-slate-100 py-4 text-slate-400">
      <Button asChild variant="ghost" size="icon" className="rounded-xl">
        <Link href="/courses" aria-label="Back to courses">
          <ArrowLeft className="h-5 w-5 stroke-[3]" />
        </Link>
      </Button>

      <h1 className="text-lg font-black text-slate-500">{title}</h1>

      <div className="h-8 w-8" />
    </div>
  );
};
