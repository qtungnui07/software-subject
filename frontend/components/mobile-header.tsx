import Image from "next/image";
import Link from "next/link";

import { MobileSidebar } from "./mobile-sidebar";

export const MobileHeader = () => {
  return (
    <nav className="fixed top-0 z-50 flex h-[56px] w-full items-center border-b-2 border-[#e4edf5] bg-white px-4 lg:hidden">
      <div className="flex w-full items-center justify-between">
        <MobileSidebar />

        <Link href="/learn" className="flex items-center gap-x-2">
          <Image src="/logo.svg" height={36} width={36} alt="Robogo logo" priority />
          <span className="text-2xl font-extrabold tracking-tight text-[#1486CC]">
            Robogo
          </span>
        </Link>

        <div className="size-10" aria-hidden="true" />
      </div>
    </nav>
  );
};
