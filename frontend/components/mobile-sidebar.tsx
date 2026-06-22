"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const MobileSidebar = ({ isLoggedIn = false }: { isLoggedIn?: boolean }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-10" aria-hidden="true" />;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-2xl border-2 border-[#d6ecfb] bg-[#e8f5ff] text-[#1486CC] transition hover:bg-[#d8efff]"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="size-6" />
        </button>
      </SheetTrigger>

      <SheetContent className="z-[100] w-[304px] max-w-[88vw] p-0" side="left">
        <Sidebar isLoggedIn={isLoggedIn} />
      </SheetContent>
    </Sheet>
  );
};
