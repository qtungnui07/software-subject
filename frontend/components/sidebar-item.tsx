"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  iconSrc: string;
  href: string;
};

export const SidebarItem = ({ label, iconSrc, href }: Props) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Button
      variant={active ? "sidebar-outline" : "sidebar"}
      className="h-[58px] justify-start rounded-[18px] px-4 text-[15px]"
      asChild
    >
      <Link href={href} aria-current={active ? "page" : undefined}>
        <Image
          src={iconSrc}
          alt=""
          className="mr-4 size-8 object-contain"
          height={32}
          width={32}
        />
        <span className="truncate">{label.toUpperCase()}</span>
      </Link>
    </Button>
  );
};
