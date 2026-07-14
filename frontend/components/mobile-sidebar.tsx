"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const MobileSidebar = ({ isLoggedIn = false }: { isLoggedIn?: boolean }) => {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!mounted) {
    return <div className="size-10" aria-hidden="true" />;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-2xl border-2 border-[#d6ecfb] dark:border-[#202f36] bg-[#e8f5ff] dark:bg-[#1c3547] text-[#1486CC] dark:text-[#38bdf8] transition hover:bg-[#d8efff] dark:hover:bg-[#254256]"
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
